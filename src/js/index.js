import * as THREE from "./3rdLibs/three.js/three.module";
import {
  OrbitControls
}
  from "./3rdLibs/three.js/controls/OrbitControls.js"
import TWEEN from "@tweenjs/tween.js"
import { Raycaster } from './three.js-master/src/core/Raycaster'

const _VSAroud = /* glsl*/ `
			varying vec2 vUv;
    uniform float Time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform samplerCube uPerlin;

    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 eyeVector;
    varying vec3  vVertexWorldPosition;
    uniform float coeficient;
    uniform vec3  glowColor;
    mat2 rotate(float a)
    {
        float s = sin(a);
        float c = cos(a);
        return mat2(c,-s,s,c);
    }

   


    void main()
    {
        // vNormal=normal * 0.1;
        vec4 worldPosition=modelMatrix * vec4(position,1.0);
        eyeVector = normalize(worldPosition.xyz - cameraPosition);

        float t = Time * 0.1;
        mat2 rot=rotate(t);

        vec3 p0 = position;
        p0.yz=rot*p0.yz;
        vLayer0 = p0;

        mat2 rot1 = rotate(t + 10.);
        vec3 p1 = position;
        p1.xz=rot1*p1.xz;
        vLayer1 = p1;

        mat2 rot2 = rotate(t + 40.);
        vec3 p2 = position;
        p2.xy = rot2*p2.xy;
        vLayer2 = p2;

        // vUv = uv;
        // vPosition = position;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        vNormal  = normalize(normalMatrix * normal);
        // vVertexWorldPosition   = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.9);
    }
		`;
// 
const _FSAroud =/* glsl*/ `

		varying vec2 vUv;
    uniform float Time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform samplerCube uPerlin;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 eyeVector;
    varying vec3  vVertexWorldPosition;
    uniform float coeficient;
    uniform vec3  glowColor;

    vec3 brightnessToColor(float b){
      b *=0.25;
      return (vec3(b,b*b,b*b*b*b)/0.25)*0.8;
    }
  
    float Fresnel(vec3 eyeVector,vec3 worldNormal)
    {
      return pow(1.0 + dot(eyeVector,worldNormal),1.0);
    }
    float supersum(){
      float sum=0.;
      sum += textureCube(uPerlin,vLayer0).r;
      sum += textureCube(uPerlin,vLayer1).r;
      sum += textureCube(uPerlin,vLayer2).r;
      sum *=0.33;
      return sum; 
    }

    void main(){

      float brightness = supersum();
      brightness = brightness * 4. + 1.;
      float fres= Fresnel(eyeVector,vNormal);
      brightness +=pow(fres,0.1);

      vec3 col = brightnessToColor(brightness);
      // gl_FragColor = vec4(col,1.); 


      float intensity = pow(0.5 - dot(vNormal,vec3(0,0,1.0)),2.0);
      gl_FragColor = vec4(col,1.0) * intensity;
    }`;

const _VSSum = /* glsl*/ `
			varying vec2 vUv;
    uniform float Time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform samplerCube uPerlin;

    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 eyeVector;

    mat2 rotate(float a)
    {
        float s = sin(a);
        float c = cos(a);
        return mat2(c,-s,s,c);
    }

   


    void main()
    {
        vNormal=normal;
        vec4 worldPosition=modelMatrix * vec4(position,1.0);
        eyeVector = normalize(worldPosition.xyz - cameraPosition);

        float t = Time * 0.1;
        mat2 rot=rotate(t);

        vec3 p0 = position;
        p0.yz=rot*p0.yz;
        vLayer0 = p0;

        mat2 rot1 = rotate(t + 10.);
        vec3 p1 = position;
        p1.xz=rot1*p1.xz;
        vLayer1 = p1;

        mat2 rot2 = rotate(t + 40.);
        vec3 p2 = position;
        p2.xy = rot2*p2.xy;
        vLayer2 = p2;

        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
		`;
// 
const _FSSum =/* glsl*/ `

		varying vec2 vUv;
    uniform float Time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform samplerCube uPerlin;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 eyeVector;

    vec3 brightnessToColor(float b){
      b *=0.25;
      return (vec3(b,b*b,b*b*b*b)/0.2)*0.6;
    }
  
    float Fresnel(vec3 eyeVector,vec3 worldNormal)
    {
      return pow(1.0 + dot(eyeVector,worldNormal),3.0);
    }
    float supersum(){
      float sum=0.;
      sum += textureCube(uPerlin,vLayer0).r;
      sum += textureCube(uPerlin,vLayer1).r;
      sum += textureCube(uPerlin,vLayer2).r;
      sum *=0.3;
      return sum; 
    }

    void main(){
      float brightness = supersum();
      brightness = brightness * 3. + 1.;
      float fres= Fresnel(eyeVector,vNormal);
      brightness +=pow(fres,0.3);

      // float intensity=pow(0.9- dot(vNormal,vec3(0,0,1.0)),2.0);

      vec3 col = brightnessToColor(brightness);
      gl_FragColor = vec4(col,1.); 
      // gl_FragColor =textureCube(uPerlin,vPosition); 
      // gl_FragColor = vec4(1.,0.6,0.2,1.0); 
    }`;

const _VS = /* glsl*/ `
			varying vec2 vUv;
    attribute float percent;
    varying float opacity;
    uniform float Time;
    uniform float number;
    uniform float speed;
    uniform float length;
    uniform float size;
    varying vec3 vPosition;

    void main()
    {
        vUv = uv;
        vPosition=position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
		`;
// 
const _FS =/* glsl*/ `
        vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        float mod289(float x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
        }

        float permute(float x) {
        return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
        return 1.79284291400159 - 0.85373472095314 * r;
        }

        float taylorInvSqrt(float r)
        {
        return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec4 grad4(float j, vec4 ip)
        {
        const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
        vec4 p,s;

        p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
        p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
        s = vec4(lessThan(p, vec4(0.0)));
        p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

        return p;
        }

        #define F4 0.309016994374947451

        float snoise(vec4 v)
        {
        const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
        0.276393202250021,  // 2 * G4
        0.414589803375032,  // 3 * G4
        -0.447213595499958); // -1 + 4 * G4

        // First corner
        vec4 i  = floor(v + dot(v, vec4(F4)) );
        vec4 x0 = v -   i + dot(i, C.xxxx);

        // Other corners

        // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
        vec4 i0;
        vec3 isX = step( x0.yzw, x0.xxx );
        vec3 isYZ = step( x0.zww, x0.yyz );
        //  i0.x = dot( isX, vec3( 1.0 ) );
        i0.x = isX.x + isX.y + isX.z;
        i0.yzw = 1.0 - isX;
        //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
        i0.y += isYZ.x + isYZ.y;
        i0.zw += 1.0 - isYZ.xy;
        i0.z += isYZ.z;
        i0.w += 1.0 - isYZ.z;

        // i0 now contains the unique values 0,1,2,3 in each channel
        vec4 i3 = clamp( i0, 0.0, 1.0 );
        vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
        vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

        //  x0 = x0 - 0.0 + 0.0 * C.xxxx
        //  x1 = x0 - i1  + 1.0 * C.xxxx
        //  x2 = x0 - i2  + 2.0 * C.xxxx
        //  x3 = x0 - i3  + 3.0 * C.xxxx
        //  x4 = x0 - 1.0 + 4.0 * C.xxxx
        vec4 x1 = x0 - i1 + C.xxxx;
        vec4 x2 = x0 - i2 + C.yyyy;
        vec4 x3 = x0 - i3 + C.zzzz;
        vec4 x4 = x0 + C.wwww;

        // Permutations
        i = mod289(i);
        float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
        vec4 j1 = permute( permute( permute( permute (
        i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
        + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
        + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
        + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

        // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
        // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
        vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

        vec4 p0 = grad4(j0,   ip);
        vec4 p1 = grad4(j1.x, ip);
        vec4 p2 = grad4(j1.y, ip);
        vec4 p3 = grad4(j1.z, ip);
        vec4 p4 = grad4(j1.w, ip);

        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        p4 *= taylorInvSqrt(dot(p4,p4));

        // Mix contributions from the five corners
        vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
        vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
        m0 = m0 * m0;
        m1 = m1 * m1;
        return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
        + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

        }

        float fbm(vec4 p)
        {
          float sum=0.;
          float amp=1.;
          float scale=2.;
          for(int i=0;i<20;i++)
          {
            sum+=snoise(p*scale)*amp;
            p.w+=100.;
            amp *=0.7;
            scale *=3.;
          }
          return sum;
        }

    uniform vec3 color;
    varying float opacity;
		varying vec2 vUv;
    uniform float Time;
    varying vec3 vPosition;
    void main(){
      vec4 p = vec4(vec4(vPosition*4.,Time * 0.1));
      float noisy=fbm(p);
      vec4 p1=vec4(vPosition*2.,Time*0.1);
      float spots = max(snoise(p1),0.);
      gl_FragColor = vec4(noisy);
      gl_FragColor *=mix(1.,spots,0.7);
    }`;

var controls;
var directionalLight, width, height, camera, renderer, loader, mixer, scene, Truck, point, i = 0, cubeRenderTarget1, cubeCamera1, material, geometrySum, materialSum, materialAroud, mouse, raycaster, name = 'Sum';
var clock = new THREE.Clock()
var starArray = [];
// 选项
initThree();
initCamera();
initScene();
initDirectionalLight();
initAmLight();
initMercury();//水星
initVenusSurface();//金星
initEarth();//地球
initMars();//火星
initJupiter();//木星
initSaturn();//土星
initUranus();//天王星
initNeptune();//海王星
iniTexture();//纹理
iniAroud();
initSun();//太阳
initClick();
animate();
function initClick() {
  raycaster = new Raycaster(); //光线投射，用于确定鼠标点击位置
  mouse = new THREE.Vector2(); //创建二维平面
  window.addEventListener('dblclick', onmousedown, false);
}

//点击事件
function onmousedown(e) {
  mouse.x = e.clientX / renderer.domElement.clientWidth * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight * 2) + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(starArray);
  if (intersects.length > 0) {
    var obj = intersects[0].object;
    name = obj.name;
    var food = { x: camera.position.x, y: camera.position.y, z: camera.position.z, };
    let tween = new TWEEN.Tween(food).to({ x: obj.position.x, y: obj.position.y, z: obj.position.z + 30 }, 1);
    tween.easing(TWEEN.Easing.Quadratic.Out);
    tween.onUpdate(function () {
      //更新函数
      camera.position.set(food.x, food.y, food.z)
    });
    tween.onComplete(function () {
      //结束函数
    });
    tween.start();
  }

}

function iniAroud() {
  var geometry = new THREE.SphereBufferGeometry(22, 210, 210);
  materialAroud = new THREE.ShaderMaterial(
    {
      uniforms: {
        Time: {
          value: 0
        },
        uPerlin: {
          value: null
        },
        resolution: {
          value: new THREE.Vector4()
        },
        coeficient: {
          value: 0.0001
        },
        glowColor: {
          value: new THREE.Color('red')
        }
      },
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable'
      },
      transparent: true,
      opacity: 0.8,
      side: THREE.BackSide,
      vertexShader: _VSAroud,//顶点着色器部分
      fragmentShader: _FSAroud,// 片元着色器部分
    }
  );
  var mesh = new THREE.Mesh(geometry, materialAroud);
  mesh.name = 'SumAroud'
  scene.add(mesh);
}
function initSun() {
  // var geometry = new THREE.SphereBufferGeometry(1, 30, 30);
  // var material = new THREE.MeshLambertMaterial({ color: 0xFFCC00 });
  // material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/sun.JPG')
  // var mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  var geometry = new THREE.SphereBufferGeometry(20, 210, 210);
  material = new THREE.ShaderMaterial(
    {
      uniforms: {
        Time: {
          value: 0
        },
        uPerlin: {
          value: null
        },
        resolution: {
          value: new THREE.Vector4()
        }
      },
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable'
      },
      side: THREE.DoubleSide,
      vertexShader: _VSSum,//顶点着色器部分
      fragmentShader: _FSSum,// 片元着色器部分
    }
  );
  var mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Sum'
  scene.add(mesh);
}
function iniTexture() {
  cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
  });

  // cubeCamera1.position.set(0,0,0);
  cubeCamera1 = new THREE.CubeCamera(0.1, 10, cubeRenderTarget1);
  geometrySum = new THREE.SphereBufferGeometry(1, 30, 30);
  materialSum = new THREE.ShaderMaterial(
    {
      uniforms: {
        Time: {
          value: 0
        },
        resolution: {
          value: new THREE.Vector4()
        }
      },
      side: THREE.DoubleSide,
      vertexShader: _VS,//顶点着色器部分
      fragmentShader: _FS,// 片元着色器部分
    }
  );
  // var mesh = new THREE.Mesh(geometry, material);
  var mesh = new THREE.Mesh(geometrySum, materialSum);
  mesh.name = 'AAA'
  // mesh.material.visible =false
  scene.add(mesh);

}

//水星
function initMercury() {

  var radius = 30,
    segments = 1024,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/mercury.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '水星'
  mesh.scale.set(1, 1, 1);
  starArray.push(mesh)
  scene.add(mesh);
}

//金星
function initVenusSurface() {

  var radius = 45,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/venus_surface.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '金星'
  mesh.scale.set(2, 2, 2);
  starArray.push(mesh)
  scene.add(mesh);
}
//地球
function initEarth() {

  var radius = 60,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/earth.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '地球'
  mesh.scale.set(2.5, 2.5, 2.5);
  starArray.push(mesh)
  scene.add(mesh);
}
//火星
function initMars() {

  var radius = 80,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/mars.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '火星'
  mesh.scale.set(3, 3, 3);
  starArray.push(mesh)
  scene.add(mesh);
}
//木星
function initJupiter() {

  var radius = 100,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/jupiter.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '木星'
  mesh.scale.set(6, 6, 6);
  starArray.push(mesh)
  scene.add(mesh);
}
//土星
function initSaturn() {

  var radius = 120,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/saturn.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '土星'
  mesh.scale.set(6.2, 6.2, 6.2);
  starArray.push(mesh)
  scene.add(mesh);
}
//天王星
function initUranus() {

  var radius = 140,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/uranus.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '天王星'
  mesh.scale.set(3.5, 3.5, 3.5);

  starArray.push(mesh)
  scene.add(mesh);
}
//海王星
function initNeptune() {

  var radius = 160,
    segments = 4096,
    material = new THREE.LineBasicMaterial({ color: 0xffffff }),
    geometry = new THREE.CircleGeometry(radius, segments);

  // Remove center vertex
  geometry.vertices.shift();
  var line = new THREE.LineLoop(geometry, material)
  scene.add(line);

  var geometry = new THREE.SphereGeometry(1, 64, 64);
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  material.map = new THREE.TextureLoader().load('../Resources/贴图/星球/neptune.JPG')
  var mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(3.5, 3.5, 3.5);
  var index = randomNum(0, line.geometry.vertices.length - 1);
  mesh.userData = { data: line.geometry.vertices, index: index }
  mesh.position.copy(line.geometry.vertices[index])
  mesh.name = '海王星'
  starArray.push(mesh)
  scene.add(mesh);
}
//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
function initAmLight() {
  const Ambient_Light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(Ambient_Light);
}

function initDirectionalLight() {
  // directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLight.position.set(2000, 2000, -500);
  // scene.add(directionalLight);
}

function initThree() {
  width = document.getElementById('sceneCanvas').clientWidth;

  height = document.getElementById('sceneCanvas').clientHeight;
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  // renderer.autoClear = false;
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMapSoft = true; //关键
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap; //关键
  document.getElementById('sceneCanvas').appendChild(renderer.domElement);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
  camera.position.set(0, 0, 100);
  controls = new OrbitControls(camera, renderer.domElement);
}
function genCubeUrls(prefix, postfix) {
  return [
    prefix + 'px' + postfix, prefix + 'nx' + postfix,
    prefix + 'py' + postfix, prefix + 'ny' + postfix,
    prefix + 'pz' + postfix, prefix + 'nz' + postfix
  ];
}
function initScene() {
  scene = new THREE.Scene();
  // scene.background=new THREE.Color('#eee');
  const urls = genCubeUrls('../Resources/贴图/MilkyWay/', '.jpg');
  new THREE.CubeTextureLoader().load(urls, function (cubeTexture) {
    cubeTexture.encoding = THREE.sRGBEncoding;
    scene.background = cubeTexture;
    // lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));

    // const geometry = new THREE.SphereGeometry(5, 64, 32);
    // //const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );

    // const material = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   metalness: 0,
    //   roughness: 0,
    //   envMap: cubeTexture,
    //   envMapIntensity: API.envMapIntensity,
    // });

    // // mesh
    // mesh = new THREE.Mesh(geometry, material);
    // scene.add(mesh);

    // render();

  });
}

function animate() {
  TWEEN.update();
  updateStar();
  updatePosition();
  cubeCamera1.update(renderer, scene);

  material.uniforms.Time.value += 0.002;
  material.uniforms.uPerlin.value = cubeRenderTarget1.texture;
  materialSum.uniforms.Time.value += 0.002;
  materialAroud.uniforms.Time.value += 0.002;
  camera.lookAt(scene.getObjectByName('Sum').position)
  // if (name != 'Sum') {
  //   console.log(name)
  //   var position = scene.getObjectByName(name).position;
  //   position.z += 30;
  //   camera.position.copy(position)
  //   // camera.lookAt(scene.getObjectByName(name).position)

  // }
  // else {
  // }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function updateStar() {
  starArray.forEach((item) => {
    item.rotateZ(0.001);
  })
}
var t1 = 0;
function updatePosition() {
  var time = clock.getDelta();
  t1 += time;
  if (t1 * 1000 > 50) {
    t1 = time;
    starArray.forEach((item) => {
      if (item.userData.index == item.userData.data.length - 1) {
        item.userData.index = 0;
      }
      item.position.copy(item.userData.data[item.userData.index]);
      item.userData.index += 1;
    })
  }
}