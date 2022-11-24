import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
export default class TransformControl {
  constructor(camera, renderer, orbControl, sceneMode) {
    this.isMesh = false
    this.camera = camera
    this.renderer = renderer
    this.orbControl = orbControl
    this.curChooseObj = null
    this.selectionBox = null
    this.transformControls = null
    this.sceneMode = sceneMode

    this.eventChange = () => {}
  }

  Init() {
    this.addBoxHelper()
    this.addTransform()
    let group = new THREE.Group()
    group.add(this.selectionBox)
    group.add(this.transformControls)
    this.object = group
  }
  Reset() {
    this.selectionBox.visible = false
    this.transformControls.visible = false
    this.transformControls.detach()
  }
  Choose(obj) {
    this.curChooseObj = obj
    this.selectionBox.setFromObject(this.curChooseObj)
    this.selectionBox.visible = true
    this.transformControls.visible = true
    this.transformControls.attach(this.curChooseObj)
  }

  addBoxHelper() {
    this.selectionBox = new THREE.BoxHelper()
    this.selectionBox.material.depthTest = false
    this.selectionBox.material.transparent = true
    this.selectionBox.visible = false
  }

  addTransform() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.transformControls.axis = 'XZ'
    this.transformControls.showY = false
    this.transformControls.visible = false
    this.transformControls.addEventListener('change', () => {
      this.changeControl()
      this.eventChange()
      // 事件
      // this.emit('change', this.curChooseObj)
      // console.log('position:' + this.curChooseObj.position.x + ',' + this.curChooseObj.position.y + ',' + this.curChooseObj.position.z)
      
    })
    this.transformControls.addEventListener('mouseDown', () => {
      this.orbControl.enabled = false
      console.log('down')
      // this.sceneMode.TYPE = 'TransformMove'
    })
    this.transformControls.addEventListener('mouseUp', (ev) => {
      this.orbControl.enabled = true
    })
    if (this.curChooseObj) {
      this.transformControls.attach(this.curChooseObj)
    }
  }

  changeControl() {
    if (this.curChooseObj) {
      this.selectionBox.setFromObject(this.curChooseObj)
    }
  }

  Update() {
  }
}
