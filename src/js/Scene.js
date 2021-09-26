import * as THREE from "./3rdLibs/three.js/three.module.js"
import {
    OrbitControls
}
from "./3rdLibs/three.js/controls/OrbitControls.js"


export default class Scene {
    constructor(canvas) {
        console.log('调用的地方')
        this.init(canvas);
        this.initGrid();
        this.beginRequestAnimationFrame();
        const self = this;
        // setTimeout(function () {
        //   self.stopRequestAnimationFrame();
        // }, 5000);
    }
    initGrid() {
        const size = 1000;
        const divisions = 1000;
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.Scene.add(gridHelper);
    }
    init(canvas) {
        const renderer = new THREE.WebGLRenderer({
            canvas
        });
        this.WebGLRenderer = renderer;

        const fov = 75;
        const aspect = 2; // 相机默认值
        const near = 0.1;
        const far = 300000;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;
        this.PerspectiveCamera = camera;
        const scene = new THREE.Scene();
        this.Scene = scene;
        console.log(this.Scene)
        scene.add(camera);
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        this.DirectionalLight = light;

        var controls = new OrbitControls(camera, renderer.domElement);

        scene.background = new THREE.Color(0xa0a0a0);
        scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);


    }

    beginRequestAnimationFrame() {
        const self = this;
        const render = function(time) {
            self.render(time);
            self.RequestAnimationFrame = requestAnimationFrame(render);
        };
        self.RequestAnimationFrame = requestAnimationFrame(render);
    }

    stopRequestAnimationFrame() {
        cancelAnimationFrame(this.RequestAnimationFrame);
        const self = this;
        const render = function() {
            requestAnimationFrame(render);
            self.WebGLRenderer.render(self.Scene, self.PerspectiveCamera);
        };
        requestAnimationFrame(render);
    }

    render(time) {
        let camera = this.PerspectiveCamera;
        let scene = this.Scene;
        let renderer = this.WebGLRenderer;

        time *= 0.001; // convert time to seconds

        if (this.resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
    }

    makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({
            color
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.xOffset = 0.02;
        cube.yOffset = 0.02;
        return cube;
    }

    resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
}