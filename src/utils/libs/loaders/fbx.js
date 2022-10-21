import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export default class FBXControl {
  constructor(scene) {
    this.scene = scene
    this.loader = new FBXLoader()
    this.obj = null
  }

  AddModel(item, pos, callback) {
    this.loader.load(item.value, (object) => {
      console.log(object)
      //
      //  new THREE.Box3().setFromObject(object).getCenter(object.position).multiplyScalar(-1)
      //
      
      object.position.set(pos.x, 0, pos.z)
      let scale = 0.01
      object.scale.set(scale, scale, scale)
      this.scene.add(object)

      this.changePos(object, item)

      this.obj = object
      this.AddTexture(item)

      callback(object)
      this.addLights()
    })
  }

  addLights() {
    for (let c of this.obj.children) {
      if (c.name == 'dx_caodi') {
        console.log(c)
      }
    }
  }

  changePos(object, item) {
    if (item.pos) {
      if (item.pos.x) {
        for (let c of object.children) {
          c.position.setX(item.pos.x)
        }
      }
      if (item.pos.y) {
        for (let c of object.children) {
          c.position.setY(item.pos.y)
        }
      }
      if (item.pos.z) {
        for (let c of object.children) {
          c.position.setZ(item.pos.z)
        }
      }
    }
    // // console.log(object)
    // // object.matrix.makeTranslation(0, 10, 0)
    // // object.applyMatrix4(object.matrix)
    // let box = new THREE.Box3().setFromObject(object)
    // let v3 = box.getSize()
    // console.log(v3)
    // for (let c of object.children) {
    //   // c.position.setY(10)
    //   c.position.setX(1500)
    // }
    // let jz = new THREE.Matrix4()
    // object.children[0].geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 10, 0 ) )
    // object.translateX(-10)
    // object.updateMatrix()
    // var box = new THREE.Box3().setFromObject(object)
    // box.getCenter(object.position)
    // object.position.multiplyScalar(-1)
  }

  AddTexture(item) {
    if (item.text) {
      for (let c of this.obj.children) {
        this.attachText(item.text, c)
      }
    }
  }

  attachText(text, c) {
    if (c.material && text[c.material.name]) {
      var texture = new THREE.TextureLoader().load(text[c.material.name])
      c.material.map = texture 
    }
    if (c.children && c.children.length > 0) {
      for (let ci of c.children) {
        this.attachText(text, ci)
      }
    }
  }

}
