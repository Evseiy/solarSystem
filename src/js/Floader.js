


import { FBXLoader } from "./three.js-master/examples/jsm/loaders/FBXLoader"
import Main from "./Main";
let m = new Main();
export function initObj() {
  var loader = new FBXLoader();
  loader.load('../Resources/模型/江阴港/jy_jizhuangxiang00.FBX',
    function (object) {
      object.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      m.Scene.Scene.add(object.children[0]);
      console.log(m.Scene.Scene)
    });
}