import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

import Text from './text'

export default class Line {
  constructor() {
    this.group = new THREE.Group()
    this.groupPoints = null
    this.pointNumber = 5
    this.rline = null
    this.vline = null
    this.curve = null
    this.points = []
    this.needAddInfo = true
    this.needUpdateInfo = true
    this.cubeSize = 5
    this.uuid = THREE.MathUtils.generateUUID()
    this.addLabel = true
    this.typeMode = 'measure' // measure
  }

  Init(pos) {
    if (!pos) {
      this.points.push(new THREE.Vector3(0, 0, 0))
      this.points.push(new THREE.Vector3(Math.random() * 20 + 10, 0, 0))
      this.addVirtualLine(this.points)
      this.addCube(this.points)
      this.group.userData = {
        parent: this
      }
      this.object = this.group
    } else if (pos.length > 0) {
      for (let p of pos) {
        this.points.push(new THREE.Vector3(p.pos.x, p.pos.y, p.pos.z))
      }
      console.log(this.points)
      this.addVirtualLine(this.points)
      this.addCubeForExtist(pos)
      this.group.userData = {
        parent: this
      }
      this.object = this.group
    } else {
      this.group.userData = {
        parent: this
      }
      this.object = this.group
    }
    // this.addRealLine(this.points)
  }

  Hide() {
    this.object.visible = false
  }

  Update() {
  }

  AddInfo(pos) {
    this.points.push(pos)
    if (this.points.length == 1) {
      this.addCube(this.points)
    } else if (this.points.length == 2 && !this.curve) {
      this.addVirtualLine(this.points)
      this.addNewCube(pos)
    } else if (this.points.length > 1) {
      // this.addRealLineInfo(pos)
      this.updateVirtualLine()
      this.addNewCube(pos)
    }
  }

  UpdateInfo(cube) {
    let pos = cube.position
    let inx = cube.userData.inx
    this.points[inx] = pos
    
    if (this.addLabel) {
      this.updateTxt(cube)
    }
    
    // this.updateRealLine(pos, inx)
    if (this.points.length > 1) {
      this.updateVirtualLine()
    }
  }

  updateTxt(cube) {
    let inx = cube.userData.inx
    if (inx > 0) {
      let dis = this.getDistance(inx)
      cube.children[0].userData.parent.UpdateTxt(dis + '米')
    }
  }

  getDistance(inx) {
    let dis = 0
    for (let i=0;i<inx;i++) {
      dis += this.points[i].distanceTo(this.points[i + 1])
    }
    dis = parseInt(dis / 5)
    return dis
  }

  DeleteInfo(cube) {
    let inx = cube.userData.inx
    this.points.splice(inx, 1)

    if (this.points.length > 1) {
      this.updateVirtualLine()
    } else {
      this.group.remove(this.vline)
      this.curve = null
    }
    
    this.groupPoints.remove(cube)
    let rinx = 0
    for (let p of this.groupPoints.children) {
      p.userData.inx = rinx++
    }
    this.resetTxt()
  }

  resetTxt() {
    for(let i=0;i<this.points.length;i++) {
      if (i == 0) {
        this.groupPoints.children[i].children[0].userData.parent.UpdateTxt('起点')
      } else {
        let dis = this.getDistance(i)
        this.groupPoints.children[i].children[0].userData.parent.UpdateTxt(dis + '米')
      }
    }
  }

  addRealLine(points) {
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff, linewidth: .005,
    })
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    this.rline = new THREE.Line(geometry, material)
    this.rline.userData = {
      PID: this.uuid
    }
    this.group.add(this.rline)
  }
  updateRealLine(pos, inx) {
    let linepos = this.rline.geometry.attributes.position
    linepos.setXYZ(inx, pos.x, pos.y, pos.z)
    linepos.needsUpdate = true
  }
  addRealLineInfo() {
    const geometry = new THREE.BufferGeometry().setFromPoints(this.points)
    this.rline.geometry = geometry
    this.rline.needsUpdate = true
  }

  addVirtualLine(points) {
    let curve = new THREE.CatmullRomCurve3(points)
    curve.curveType = 'catmullrom'
    curve.tension = 0
    curve.closed = false
    const vpoints = curve.getPoints(this.points.length * 50)
    let vps = []
    for (let p of vpoints) {
      vps.push(p.x)
      vps.push(p.y)
      vps.push(p.z)
    }
    const geometry = new LineGeometry()
    geometry.setPositions(vps)
    // const geometry = new THREE.BufferGeometry().setFromPoints(vpoints)
    const material = new LineMaterial({ color: 0xFFFF00, linewidth: 0.003 })
    this.vline = new Line2(geometry, material)
    this.vline.userData = {
      PID: this.uuid
    }
    this.group.add(this.vline)
    this.curve = curve
  }
  updateVirtualLine() {
    let curve = new THREE.CatmullRomCurve3(this.points)
    curve.curveType = 'catmullrom'
    curve.tension = 0
    curve.closed = false
    const vpoints = curve.getPoints(this.points.length * 50)
    // const geometry = new THREE.TubeGeometry(curve, this.points.length * 50, .5, 20, false)
    let vps = []
    for (let p of vpoints) {
      vps.push(p.x)
      vps.push(p.y)
      vps.push(p.z)
    }
    // this.vline.geometry = geometry
    const geometry = new LineGeometry()
    geometry.setPositions(vps)

    this.vline.geometry = geometry
    // this.vline.geometry.needsUpdate = true
    this.curve = curve
  }
  
  addCubeForExtist(cubes) {
    this.groupPoints = new THREE.Group()
    let inx = 0
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const materialLast = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    for (let c of cubes) {
      let size = this.cubeSize
      const geometry = new THREE.BoxGeometry(size, size, size)
      let cube = null
      if (inx == cubes.length - 1) {
        cube = new THREE.Mesh(geometry, materialLast)
      } else {
        cube = new THREE.Mesh(geometry, material)
      }
      cube.userData = {
        PID: this.uuid,
        inx: inx++,
        parent: this,
        isPausePoint: c.isPausePoint,
        data: c.type
      }
      cube.position.set(c.pos.x, c.pos.y, c.pos.z)
      cube.name = '控制点'
      this.groupPoints.add(cube)
    }
    this.group.add(this.groupPoints)
  }

  addTxt(txt) {
    let t = new Text()
    t.Init(new THREE.Vector3(0, this.cubeSize, 0), txt)
    return t.object
  }

  addCube(points) {
    this.groupPoints = new THREE.Group()
    let inx = 0
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const materialLast = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    for (let p of points) {
      let size = this.cubeSize
      const geometry = new THREE.BoxGeometry(size, size, size)
      // let cubeGroup = new THREE.Group()
      let cube = null
      if (inx == points.length - 1) {
        cube = new THREE.Mesh(geometry, materialLast)
      } else {
        cube = new THREE.Mesh(geometry, material)
      }

      cube.userData = {
        PID: this.uuid,
        inx: inx++,
        parent: this
      }
      cube.position.copy(p)
      cube.name = '控制点'

      if (this.addLabel) {
        let t = this.addTxt('起点')
        cube.add(t)
      }
      this.groupPoints.add(cube)
    }
    this.group.add(this.groupPoints)
  }

  addNewCube(p) {
    let last = this.groupPoints.children[this.groupPoints.children.length - 1]
    last.material.color = new THREE.Color(0x00ff00)

    let inx = this.points.length - 1
    let size = this.cubeSize
    const geometry = new THREE.BoxGeometry(size, size, size)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

    const cube = new THREE.Mesh(geometry, material)
    cube.userData = {
      PID: this.uuid,
      inx: inx,
      parent: this
    }
    cube.position.copy(p)
    cube.name = '控制点'

    let dis = this.getDistance(inx)
    if (this.addLabel) {
      let t = this.addTxt(dis + '米')
      cube.add(t)
    }
    this.groupPoints.add(cube)
  }
}
