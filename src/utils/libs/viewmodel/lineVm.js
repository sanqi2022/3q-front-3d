import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import Line from '@/utils/libs/entities/line'

export default class LineVm {
  constructor(scene, camera, control, transformControl, outDataViewCallback) {
    this.uuid = THREE.MathUtils.generateUUID()
    this.curlineControl = null
    this.curlineCube = null
    this.group = new THREE.Group()
    this.scene = scene
    this.camera = camera
    this.controls = control
    this.transformControl = transformControl
    this.isDrawingMode = false

    this.curSpeed = 1
    this.curPercent = 0
    this.animateTime = 50000

    this.tweenLine = null
    this.playerSprite = null
    this.spriteScale = 50.0
    this.spriteScaleStep = 1

    this.outDataViewCallback = outDataViewCallback
  }

  Init() {
    this.group.name = '动画路径组合'
    this.scene.add(this.group)
    this.AddSprite()
  }

  AddSprite() {
    const map = new THREE.TextureLoader().load('textures/person.png')
    map.encoding = THREE.sRGBEncoding
    const material = new THREE.SpriteMaterial({ map: map, transparent: true })
    this.playerSprite = new THREE.Sprite(material)
    this.playerSprite.scale.set(50, 50, 50)
    this.playerSprite.visible = false
    this.scene.add(this.playerSprite)
  }

  Update() {
    
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

  ShowAllLine() {
    this.group.visible = true
  }
  HideAllLine() {
    this.group.visible = false
  }

  AddLineControl(linename, pos) {
    let line = new Line()
    line.addLabel = false
    line.typeMode = 'draw'
    line.Init(pos)
    line.object.name = linename
    this.group.add(line.object)

    // line.Hide()

    this.curlineControl = line
    this.curlineCube = null
    return line.object
  }

  ChooseLineControlByCube(cube) {
    this.transformControl.Choose(cube)
    let linecontrol = cube.userData.parent
    this.curlineControl = linecontrol
    this.curlineCube = cube
    this.isDrawingMode = true
  }

  PrevLineControl(linecontrol) {
    // const geometry = new THREE.BoxGeometry(3, 3, 3)
    // const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
    // const cube = new THREE.Mesh(geometry, material)
    // this.scene.add(cube)
    this.startAnimate(linecontrol)
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
    }
  }

  TogglePause(pause) {
    if (pause) {
      this.tweenLine.pause()
    } else {
      this.tweenLine.resume()
    }
  }

  StopAnimate() {
    if (this.tweenLine) {
      this.tweenLine.stop()
      this.playerSprite.visible = false
    }
  }

  ChangeSpeed(speed) {
    this.tweenLine.stop()
    this.curSpeed = speed
    let duration = this.animateTime / this.curSpeed

    this.startAnimate(this.curlineControl, this.curPercent, duration * (1.0 - this.curPercent))
  }

  updatePosition(curve, percent, arrPercent, tweenLine, arrPercentData) {
    let pos = curve.getPointAt(percent.n)
    let nextPos = curve.getPointAt(percent.n + 0.01)
    pos.y += 5
    nextPos.y += 5
    
    if (arrPercent.length > 0) {
      // for (let i = 0;i < arrPercent.length;i++) {
      if (arrPercent[0] == percent.n.toFixed(2)) {
        tweenLine.pause()
        if (this.outDataViewCallback) {
          this.outDataViewCallback(arrPercentData[0])
        }
        setTimeout(() => {
          tweenLine.resume()
          arrPercent.splice(0, 1)
          arrPercentData.splice(0, 1)
          if (this.outDataViewCallback) {
            this.outDataViewCallback('')
          }
        }, 5000)
      }
      // }
    }

    this.camera.position.copy(pos)
    if (this.playerSprite) {
      this.playerSprite.position.set(pos.x, pos.y + 5, pos.z)
    }
    //创建一个4维矩阵，旋转角度
    let carMesh = this.camera
    let mtx = new THREE.Matrix4()
    mtx.lookAt(carMesh.position.clone(), nextPos, carMesh.up)
    let offsetRotate = 0
    mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetRotate, 0)))
    let toRot = new THREE.Quaternion().setFromRotationMatrix(mtx)
    carMesh.quaternion.slerp(toRot, 0.2)
  }

  startAnimate(lineControl, perval = 0, timespan = 0) {
    this.playerSprite.visible = true
    this.curlineControl = lineControl
    let curve = lineControl.curve

    let cubes = lineControl.groupPoints.children
    let totalLength = 0
    for (let i = 0;i < cubes.length - 1;i++) {
      let v1 = cubes[i].position
      let v2 = cubes[i + 1].position
      totalLength += v1.distanceTo(v2)
    }
    let arrPercent = []
    let arrPercentData = []
    let curLength = 0
    let numIndex = 0
    for (let i = 1;i < cubes.length;i++) {
      let v1 = cubes[i - 1].position
      let v2 = cubes[i].position
      curLength += v1.distanceTo(v2)
      if (cubes[i].userData.isPausePoint) {
        let per = curLength / totalLength
        arrPercent.push(per.toFixed(2))
        // arrPercentData.push(cubes[i].userData.data)
        arrPercentData.push(numIndex++)
      }
    }

    let saveArr = []
    for (let c of cubes) {
      let tmp = {
        pos: c.position,
        isPausePoint: c.userData.isPausePoint
      }
      saveArr.push(tmp)
    }
    // 当前保存
    console.log(JSON.stringify(saveArr))

    // const geometry = new THREE.SphereGeometry( 15, 32, 16 );
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    // const sphere = new THREE.Mesh( geometry, material );
    // this.scene.add( sphere )

    let percent = { n: perval }
    let tweenLine = new TWEEN.Tween(percent).to({ n: 0.99 }, timespan == 0 ? this.animateTime : timespan).onUpdate(() => {
      this.curPercent = percent.n
      
      this.updatePosition(curve, percent, arrPercent, tweenLine, arrPercentData)
    })
    tweenLine.start()

    this.tweenLine = tweenLine
  }

  Save() {
    let arr = []
    for (let lineobject of this.group.children) {
      let linecontrol = lineobject.userData.parent
      let points = linecontrol.groupPoints
      let arrPos = []
      let name = lineobject.name
      for (let c of points.children) {
        let tmp = {
          pos: c.position,
          isPausePoint: c.userData.isPausePoint
        }
        arrPos.push(tmp)
      }
      arr.push({
        name: name,
        pos: arrPos
      })
    }
    return arr
  }

}
