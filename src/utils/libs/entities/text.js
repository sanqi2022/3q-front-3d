import * as THREE from 'three'
export default class Text {
  constructor() {
    this.object = null
    this.uuid = THREE.MathUtils.generateUUID()
    this.w = 90
    this.h = 30
  }

  Init(pos, txt) {
    const map = new THREE.CanvasTexture(this.createCanvas(this.w, this.h, txt))
    map.encoding = THREE.sRGBEncoding

    let material = new THREE.SpriteMaterial({
      map: map,
      color: new THREE.Color('#ffffff'),
    })

    const sprite = new THREE.Sprite(material)
    this.map = map
    sprite.position.copy(pos)
    let ss = 1.3
    sprite.scale.set(9 / ss, 3 / ss, 1)
    sprite.userData = {
      type: 'cube-txt',
      parent: this
    }
    this.object = sprite
  }

  createCanvas(w, h, txt) {
    let canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    let ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#0ff'
    ctx.strokeRect(0, 0, w, h)
    ctx.fillStyle = '#fff'
    ctx.font = '16px 微软雅黑 bold'
    ctx.textAlign = 'center'
    ctx.fillText(txt, w / 2, 20)
    return canvas
  }

  UpdateTxt(txt) {
    let can = this.createCanvas(this.w, this.h, txt)
    this.object.material.map.image = can
    this.object.material.needsUpdate = true
    this.object.material.map.needsUpdate = true
  }

}
