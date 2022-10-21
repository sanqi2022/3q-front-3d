import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class FBXControl {
  constructor(scene) {
    this.scene = scene
    this.loader = new GLTFLoader()
    this.obj = null
  }

  AddModel(path, pos, callback) {
    this.loader.load(path, (scene) => {
      let object = scene.scene
      console.log(object)
      
      object.position.set(pos.x, 0, pos.z)
      let scale = 0.01
      object.scale.set(scale, scale, scale)
      this.scene.add(object)

      this.obj = object
      callback(object)
    })
  }
}
