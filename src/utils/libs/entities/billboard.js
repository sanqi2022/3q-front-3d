import * as THREE from 'three'
export default class Billboard {
  constructor() {
    this.object = null
    this.uuid = THREE.MathUtils.generateUUID()
  }

  Init(img, pos, txt) {
    let w = 171, h = 79
    const map = new THREE.CanvasTexture(this.createCanvas(img, w, h, txt))
    map.encoding = THREE.sRGBEncoding

    let material = new THREE.SpriteMaterial({
      map: map,
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 1,
    })

    const sprite = new THREE.Sprite(material)
    this.map = map
    let ss = w / h
    sprite.scale.set(14 * ss, 14, 0)
    sprite.position.copy(pos)
    sprite.center = new THREE.Vector2(0.5, 0.2)
    sprite.userData = {
      type: ''
    }
    this.object = sprite
  }

  createCanvas(img, w, h, txt) {
    let canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    ctx.fillStyle = '#fff'
    ctx.font = '20px 微软雅黑 bold'
    ctx.fillText(txt, 40, 30)
    return canvas
  }

}
