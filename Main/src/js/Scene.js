import * as THREE from "./3rdLibs/three.js/three.module.js"
import {
    OrbitControls
}
from "./3rdLibs/three.js/controls/OrbitControls.js"

export default class Scene {
    constructor(canvas) {
        this.init(canvas);
        this.beginRequestAnimationFrame();
        const self = this;
        setTimeout(function () {
            self.stopRequestAnimationFrame();
        }, 5000);
    }

    init(canvas) {
        const renderer = new THREE.WebGLRenderer({
            canvas
        });
        this.WebGLRenderer = renderer;

        const fov = 75;
        const aspect = 2; // 相机默认值
        const near = 0.1;
        const far = 5;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;
        this.PerspectiveCamera = camera;

        const scene = new THREE.Scene();
        this.Scene = scene;

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const cubes = [
            this.makeInstance(geometry, 0x44aa88, 0),
            this.makeInstance(geometry, 0x8844aa, -2),
            this.makeInstance(geometry, 0xaa8844, 2),
        ];
        cubes.forEach((cube, ndx) => {
            scene.add(cube);
        });
        this.Cubes = cubes;

        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        this.DirectionalLight = light;

        var controls = new OrbitControls(camera, renderer.domElement);

    }

    beginRequestAnimationFrame() {
        const self = this;
        const render = function (time) {
            self.render(time);
            self.RequestAnimationFrame = requestAnimationFrame(render);
        };
        self.RequestAnimationFrame = requestAnimationFrame(render);
    }

    stopRequestAnimationFrame() {
        cancelAnimationFrame(this.RequestAnimationFrame);
        const self = this;
        const render = function () {
            requestAnimationFrame(render);
            self.WebGLRenderer.render(self.Scene, self.PerspectiveCamera);
        };
        requestAnimationFrame(render);
    }

    render(time) {
        let camera = this.PerspectiveCamera;
        let scene = this.Scene;
        let renderer = this.WebGLRenderer;
        let cubes = this.Cubes;

        time *= 0.001; // convert time to seconds

        if (this.resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
            cube.rotation.z = rot;
            cube.position.x += cube.xOffset;
            cube.position.y += cube.yOffset;
            var tmpV = cube.position.clone();
            tmpV.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
            if (Math.abs(tmpV.x) > 1.0)
                cube.xOffset *= -1;
            if (Math.abs(tmpV.y) > 0.6)
                cube.yOffset *= -1;
        });
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