import Scene from './Scene.js'

class Main {
    constructor() {
        let cavasId = '#sceneCanvas';
        let canvas = document.querySelector(cavasId);
        this.init(canvas);
    }

    init(canvas) {
        this.Scene = new Scene(canvas);
    }
}
export default Main;