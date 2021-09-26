import * as THREE from "./3rdLibs/three.js/three.module";
import {
  OrbitControls
}
  from "./3rdLibs/three.js/controls/OrbitControls.js"


  ;
import TWEEN from "@tweenjs/tween.js"

const glsl = require("glslify");



// import glsl from "glslify"

const _VS = /* glsl*/ `
              uniform float opacity;
              varying vec2 vUv;
              varying vec3 vPosition;
              void main() {
                vPosition=position;
                vUv=uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
              }
            `;
const _FS = /* glsl */ `
        varying vec2 vUv;
        uniform vec3 iResolution;
        uniform float iTime;
        float snoise(vec3 uv, float res)
        {
          const vec3 s = vec3(1e0, 1e2, 1e3);
          uv *= res;
          vec3 uv0 = floor(mod(uv, res))*s;
          vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
          
          vec3 f = fract(uv); f = f*f*(3.0-2.0*f);

          vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                      uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);

          vec4 r = fract(sin(v*1e-1)*1e3);
          float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
          
          r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
          float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
          
          return mix(r0, r1, f.z)*2.-1.;
        }

        void main() 
        {
          vec2 p = -.5 + vUv.xy / iResolution.xy;
          p.x *= iResolution.x/iResolution.y;
          
          float color = 3.0 - (3.*length(2.*p));
          
          vec3 coord = vec3(atan(p.x,p.y)/6.2832+.5, length(p)*.4, .5);
          
          for(int i = 1; i <= 7; i++)
          {
            float power = pow(2.0, float(i));
            color += (1.5 / power) * snoise(coord + vec3(0.,-iTime*.05, iTime*.01), power*16.);
          }
          gl_FragColor  = vec4( color, pow(max(color,0.),2.)*0.4, pow(max(color,0.),3.)*0.15 , 1.0);
        }
          `


var data = {
  directionalLight: null,
  width: null,
  height: null,
  camera: null,
  renderer: null,
  scene: null,
  orbit: null,
  oldTime: new Date().getTime(),
  uniforms: null,
}
var vm = new Vue({
  // 选项
  el: '#vue-dom',
  data: data,
  mounted() {
    var _self = this
    _self.initThree();
    _self.initScene();
    _self.initCamera();
    _self.initDirectionalLight();
    _self.initAmLight();
    // _self.initMeshFloor();
    _self.initOrbit();
    _self.AddQiu();
    _self.animate();
  },
  methods: {
    AddQiu() {
      var _self = this;
      // const s1 = new THREE.Mesh(
      //   new THREE.SphereGeometry(2, 32, 32),
      //   new THREE.MeshStandardMaterial({ color: 0xffffff })
      // )
      // s1.position.set(-10, 5, 0);
      // s1.castShadow = true;
      // _self.scene.add(s1);
      // var start_time = new Date().getTime();


      const geometry = new THREE.SphereGeometry(1, 32, 16)
      const baseGemo = new THREE.IcosahedronGeometry(1, 1);//待会了解一下是什么


      const circleGemo = new THREE.CircleGeometry(1, 13);
      const points = baseGemo.vertices;
      const s2 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 16),
        new THREE.ShaderMaterial({
          // wireframe:true,
          // color:'red',
          defines: {
            POINT_COUNT: points.length
          },
          uniforms: {
            points: { value: points },
            iTime: { type: "f", value: 0 },
            opacity: { type: "f", value: 1 },
            color: { type: "vec3", value: new THREE.Color('tomato') },
            iResolution: { value: new THREE.Vector3(1, 2, 3) },
          },
          vertexShader: _VS,
          fragmentShader: _FS,
        })
      )


      s2.name = '着色器'
      // s2.position.set(0, 10, 0);
      s2.castShadow = true;
      _self.scene.add(s2);





      // console.log(points)
      // points.forEach(point => {
      //   const mesh = new THREE.Mesh(
      //     circleGemo,
      //     new THREE.MeshBasicMaterial({
      //       color: 'black',
      //       // wireframe: true,
      //       side:THREE.BackSide
      //     })
      //   )
      //   // .multiplyScalar(1.5) 待会了解一下这个是什么
      //   mesh.position.copy(point);
      //   mesh.scale.setScalar(0.25 * Math.random());
      //   mesh.lookAt(new THREE.Vector3())
      //   _self.scene.add(mesh);
      // });
    },
    initMeshFloor: function () {
      let _self = this
      let groundGeom = new THREE.BoxBufferGeometry(400, 0.2, 400);
      let groundMate = new THREE.MeshPhongMaterial({ color: 0xdddddd })
      let ground = new THREE.Mesh(groundGeom, groundMate);
      ground.position.y = -0.1;
      ground.receiveShadow = true;
      ground.castShadow = true;
      ground.name = '地面'
      _self.scene.add(ground); //step 5 添加地面网格
    },
    initGrid() {
      const size = 1000;
      const divisions = 1000;
      const gridHelper = new THREE.GridHelper(size, divisions);
      gridHelper.name = '网格'
      gridHelper.castShadow = true;
      gridHelper.receiveShadow = true;
      this.scene.add(gridHelper);
    },
    initAmLight() {
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0.5);
      hemiLight.position.set(0, 20, 0);
      // const Ambient_Light = new THREE.AmbientLight(0xffffff, 0.4);
      hemiLight.name = '环境光'
      this.scene.add(hemiLight);
    },
    initDirectionalLight() {
      let _self = this;
      _self.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      _self.directionalLight.position.set(27, 18, 64);
      _self.directionalLight.castShadow = true;
      _self.directionalLight.shadow.camera.near = 0.1; //产生阴影的最近距离
      _self.directionalLight.shadow.camera.far = 1000; //产生阴影的最远距离
      _self.directionalLight.shadow.camera.left = -1000; //产生阴影距离位置的最左边位置
      _self.directionalLight.shadow.camera.right = 1000; //最右边
      _self.directionalLight.shadow.camera.top = 1000; //最上边
      _self.directionalLight.shadow.camera.bottom = -1000; //最下面
      _self.directionalLight.shadow.mapSize.height = 10000;
      _self.directionalLight.shadow.mapSize.width = 10000;
      _self.directionalLight.name = '平行光'
      _self.scene.add(_self.directionalLight);
    },
    initOrbit() {
      var _self = this
      _self.orbit = new OrbitControls(_self.camera, _self.renderer.domElement);
      _self.orbit.target = new THREE.Vector3(0, 0, 0);//控制焦点

      _self.camera.lookAt(0, 0, 0)
      _self.orbit.update();
    },
    initThree() {
      let _self = this

      _self.clock = new THREE.Clock()
      _self.width = document.getElementById('sceneCanvas').clientWidth;

      _self.height = document.getElementById('sceneCanvas').clientHeight;
      _self.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      _self.renderer.setSize(_self.width, _self.height);
      _self.renderer.autoClear = false;
      _self.renderer.shadowMap.enabled = true;
      _self.renderer.shadowMapSoft = true; //关键
      _self.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //关键
      document.getElementById('sceneCanvas').appendChild(_self.renderer.domElement);
    },
    //摄像机
    initCamera() {
      let _self = this;
      _self.camera = new THREE.PerspectiveCamera(75, _self.width / _self.height, 0.1, 1000);
      _self.camera.position.set(10, 10, 10);
      _self.camera.lookAt(0, 10, 0)
      _self.scene.add(_self.camera)
    },
    initScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xa0a0a0);
      this.scene.fog = new THREE.FogExp2(0xa0a0a0, 0.01);
      // var group = new THREE.Object3D();
      // group.name = '组合'
      // this.scene.add(group);
    },
    animate() {

      var time = new Date().getTime();
      // var delta = 0.001 * ( time - this.oldTime );
      // this.oldTime = time;

      // uniforms.time.value += 0.275 * delta;


      TWEEN.update();
      // var time = (Date.now() - mesh.startTime) / 1000
      this.scene.getObjectByName('着色器').material.uniforms.iTime.value += 0.01
      // mesh.uniforms.iGlobalTime.value = time
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.animate);
    }
  }
})