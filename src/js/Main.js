import Scene from './Scene.js'

class Main {
    constructor() {
        const cavasId = '#sceneCanvas';
        let canvas = document.querySelector(cavasId);
        this.init(canvas);
    }

    init(canvas) {
        this.Scene = new Scene(canvas);
        console.log(this.Scene)
    }
}
export default Main;