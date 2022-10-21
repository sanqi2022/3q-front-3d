import * as THREE from 'three'
import Line from '@/utils/libs/entities/line'

export default class MeasureVm {
  constructor(scene, camera, control, transformControl) {
    this.uuid = THREE.MathUtils.generateUUID()
    this.group = new THREE.Group()
    this.scene = scene
    this.camera = camera
    this.controls = control
    this.transformControl = transformControl
    this.isDrawingMode = false
    this.curlineControl = null
    this.curlineCube = null
  }
  Init() {
    this.group.name = '测量'
    this.scene.add(this.group)
  }

  Reset() {
    this.curlineControl = null
    this.curlineCube = null
  }
  ToggleMode() {
    if (this.isDrawingMode) {
      this.isDrawingMode = false
      this.controls.mouseButtons.RIGHT = 2
      this.transformControl.Reset()
      this.Reset()
    } else {
      this.isDrawingMode = true
      this.controls.mouseButtons.RIGHT = -1
    }
  }
  StopEdit() {
    this.isDrawingMode = false
    this.controls.mouseButtons.RIGHT = 2
    this.transformControl.Reset()
    this.Reset()
    document.body.style.cursor = 'default'
  }
  StartEdit() {
    this.isDrawingMode = true
    this.controls.mouseButtons.RIGHT = -1
    document.body.style.cursor = 'url(/3d/ruler.cur),auto'
  }

  AddLineControl(linename) {
    let line = new Line()
    line.addLabel = true
    line.typeMode = 'measure'
    line.cubeSize = 2
    line.Init([])
    line.object.name = linename
    this.group.add(line.object)

    this.curlineControl = line
    this.curlineCube = null
    return line.object
  }

  ChooseLineControlByCube(cube) {
    this.transformControl.Choose(cube)
    let linecontrol = cube.userData.parent
    this.curlineControl = linecontrol
    this.curlineCube = cube
    this.StartEdit()
  }

  ///////
  AddCurLineCube(pos) {
    if (this.isDrawingMode && this.curlineControl) {
      this.curlineControl.AddInfo(pos)
    }
  }
  UpdateCurLineCube() {
    if (this.isDrawingMode && this.curlineControl && this.curlineCube) {
      this.curlineControl.UpdateInfo(this.curlineCube)
    }
  }
  DeleteCurLineCube() {
    if (this.isDrawingMode && this.curlineControl && this.curlineCube) {
      this.transformControl.Reset()
      this.curlineControl.DeleteInfo(this.curlineCube)
      this.Reset()
      this.StopEdit()
    }
  }

}