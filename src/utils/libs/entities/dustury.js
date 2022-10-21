import * as THREE from 'three';
import Component from '../common/Component'
import { Ammo, createConvexHullShape } from '../common/AmmoLib'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AddObject, AddHideObject } from '@/api/sceneObjects'
import TWEEN from '@tweenjs/tween.js';

export default class DusturyMesh extends Component {
  constructor(world, scene, focusFun) {
    super();
    this.scene = scene;
    this.name = "DusturyMesh";
    this.physicsWorld = world

    this.uniforms = {
      jt: { value: new THREE.TextureLoader().load('/textures/jt.png') },
      time: { value: -0.5 }
    }

    this.ufs = {
      pos: {value: 0.1}
    }

    this.spes = new THREE.Group()

    this.object = null
    this.focusFun = focusFun

    this.gmap = null
  }

  initMesh() {
    var loader = new FBXLoader();

    // loader.load('/model/new/jigui.FBX', (object) => {
    //   // console.log(object)
    //   for (let c of object.children) {
    //     c.userData.type = 'jiguiP'
    //     let str = c.name
    //     c.name = '111.' + str.substring(2, str.length - 1)
    //     AddObject(c, [], 2)
    //     for (let d of c.children) {
    //       d.userData.type = 'jigui'
    //       AddObject(d, [], 22)
    //     }
    //   }
    //   object.position.set(0, 5, 0)
    //   let scale = 0.01;
    //   object.scale.set(scale, scale, scale)
    //   object.rotateY(-Math.PI * 3 / 4)
    //   this.scene.add(object);
    // });

    loader.load('/model/new/shexiangtou.glb', (object) => {
      console.log(object)
      for (let o of object.children) {
        // o.userData.type = 'camera'

        // let str = o.name.replace('cam', '')
        // if (str.length == 7) {
        //   o.name = str[0] + str[1] + '.' + str[2] + str[3] + '.' + str[4] + '.' + str[5] + str[6]
        // } else {
        //   o.name = str
        // }

        // AddObject(o, [], 0)
      }
      object.position.set(0, 5, 0)
      let scale = 0.01;
      object.scale.set(scale, scale, scale)
      object.rotateY(-Math.PI * 3 / 4)
      this.scene.add(object);
    });


    // loader.load('/model/new/qita.FBX', (object) => {
    //   // console.log(object)
    //   for (let o of object.children) {
    //     // console.log(o.name)
    //     if (o.name == 'Ground01' || o.name == 'Grass') {
    //       AddHideObject(o)
    //     }
    //   }
    //   object.position.set(0, 5, 0)
    //   let scale = 0.01;
    //   object.scale.set(scale, scale, scale)
    //   object.rotateY(-Math.PI * 3 / 4)
    //   this.scene.add(object);
    // });
  }

  initMesh2() {
    var loader = new FBXLoader();

    // let path = require('../../../../public/model/fuian1.FBX')
    loader.load('/model/futian.FBX', (object) => {
      console.log(object)
      for (let c of object.children) {
        if (c.name.indexOf('cam') >= 0) {
          AddObject(c, [], 0)
        }
      }

      object.position.set(0, 5.3, 0)
      // object.rotateX(-Math.PI / 2);
      let scale = 0.01;
      object.scale.set(scale, scale, scale)
      this.scene.add(object);
      object.children[5].receiveShadow = true;
      /// 摄像头
      // AddObject(object.children[5], [])
      /////
      let p1 = new THREE.Vector3(-85.929, 6, -12.767)
      let p2 = new THREE.Vector3(-85.929, 6, 2.147)
      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
      });
      const points = [];
      points.push(p1);
      points.push(p2);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);

      let ground = object.children[1].children[2]
      // ground.visible = false
      // ground.material.color = new THREE.Color(0xff0000)
      // let arr = []
      // for (let c of ground.material) {
      //   c.color = new THREE.Color(0xff0000)
      // }
      AddHideObject(ground)
      // for (let c of object.children) {
      //   if (c.name.indexOf('cam') < 0) {
      //     c.visible = false
      //   }
      // }

      // AddObject(object.children[6], [object.children[3].children[27]], 0)
      // let c2 = object.children[6].children[2]
      // AddObject(object.children[6].children[2], [], 1)
      // console.log(c1)

      // for (let o of object.children[3].children) {
      //   if (o.name == 'building03') {
      //     AddObject(o)
      //   }
      // }
    })
  }

  validIP (ipstr) {
    var reg = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))).){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/
    if (reg.test(ipstr)) {
      return true
    }
    return false
  }
  initGLTF() {
    let loader = new GLTFLoader()
    // loader.load('/model/ft/ground.glb', (scene) => {
    //   let object = scene.scene
    //   object.position.set(0, 5, 0)
    //   let scale = 10;
    //   object.scale.set(scale, scale, scale)
    //   this.scene.add(object)
    //   for (let o of object.children[0].children) {
    //     console.log(o.name)
    //     if (o.name === 'mesh_0_12' || o.name === 'mesh_0_11') {
    //       AddHideObject(o)
    //     }
    //   }
    // })
    // loader.load('/model/ft/guan.glb', (scene) => {
    //   let object = scene.scene
    //   for (let o of object.children[0].children) {
    //     for (let m of o.children) {
    //       m.userData.type = 'line'
    //       AddObject(m, [], 0)
    //     }
    //   }
    //   object.position.set(0, 5, 0)
    //   let scale = 10;
    //   object.scale.set(scale, scale, scale)
    //   this.scene.add(object)
    // })

    loader.load('/model/new/jigui.glb', (scene) => {
      let object = scene.scene
      // console.log(object)
      for (let c of object.children) {
        c.userData.type = 'jiguiP'
        let str = c.name
        // c.name = '111.' + str.substring(2, str.length - 1)
        c.name = str
        if(str.indexOf('粒子') < 0) {
          AddObject(c, [], 2)
          console.log(str)
          for (let d of c.children) {
            d.userData.type = 'jigui'
            AddObject(d, [], 22)
          }
        }
      }
      object.position.set(0, 5, 0)
      let scale = 10;
      object.scale.set(scale, scale, scale)
      this.scene.add(object)
    });
    loader.load('/model/new/qita.glb', (scene) => {
      let object = scene.scene
      console.log(object)
      for (let o of object.children) {
        // console.log(o.name)
        if (o.name == 'Ground01' || o.name == 'Grass') {
          AddHideObject(o)
        }
      }
      object.position.set(0, 5, 0)
      let scale = 10;
      object.scale.set(scale, scale, scale)
      this.scene.add(object)
    });

    loader.load('/model/new/shexiangtou.glb', (scene) => {
      let object = scene.scene
      console.log(object)
      for (let o of object.children) {
        o.userData.type = 'camera'
        
        let isCam = false
        let cams = []
        if (o.children && o.children.length > 0) {
          for (let cc of o.children) {
            let name = cc.name
            if (this.validIP(name)) {
              isCam = true
              cams.push(name)
              console.log(name.length)
            }
          }
        }
        if (isCam) {
          for (let n of cams) {
            let str = n
            let newname = ''
            if (str.length == 7) {
              newname = str[0] + str[1] + '.' + str[2] + str[3] + '.' + str[4] + '.' + str[5] + str[6]
            } else if (str.length == 8) {
              newname = str[0] + str[1] + '.' + str[2] + str[3] + '.' + str[4] + '.' + str[5] + str[6] + str[7]
            }
            o.name = newname
            AddObject(o, [], 0)
          }
        }
        // if(o.name.indexOf('粒子') < 0) {
        //   let str = o.name.replace('cam', '')
        //   if (str.length == 7) {
        //     o.name = str[0] + str[1] + '.' + str[2] + str[3] + '.' + str[4] + '.' + str[5] + str[6]
        //   } else {
        //     o.name = str
        //   }

        //   AddObject(o, [], 0)
        // }
      }
      object.position.set(0, 5, 0)
      let scale = 10;
      object.scale.set(scale, scale, scale)
      this.scene.add(object)
    })
  }

  SetStaticCollider(mesh) {
  }

  Update() {
    this.uniforms.time.value += 0.01
    this.ufs.pos.value += 0.01
    if (this.ufs.pos.value > 1 ) {
      this.ufs.pos.value = 0
    }
    ////////
    for (let c of this.spes.children) {
      let z = c.position.y
      z += 0.01
      if (z > 100) {
        c.position.setY(0)
      } else {
        c.position.setY(z)
      }
    }
    if (this.gmap) {
      this.gmap.offset.x = this.uniforms.time.value
    }
  }

  getMaterial() {

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
      varying vec2 vUv;
			void main() {
        vUv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
			}`,
      fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D jt; 
      uniform float time; 
			void main() {
        // vec2 uu = normalize(vUv);
        // float x = smoothstep(0.0, 3.14 / 2.0, vUv.y + time);
        float x = fract(vUv.x * 2.0 + time);
        vec4 c = texture2D( jt, vec2(vUv.y, x) );
        vec3 vColor = vec3(0.0, vUv.y, 0.0);
				gl_FragColor = c;
			}`,

      side: THREE.DoubleSide
    })
    const geometry = new THREE.PlaneGeometry(100, 100);
    const plane = new THREE.Mesh(geometry, shaderMaterial);
    this.scene.add(plane);
    return shaderMaterial
  }


  addSP() {
    let height = 100

    const map = new THREE.TextureLoader().load('/textures/jt2.png')
    const material = new THREE.SpriteMaterial({ map: map })
    for (let i = 0; i <= height; i += 2) {
      const sprite = new THREE.Sprite(material)
      sprite.position.setY(i)
      this.spes.add(sprite)
      this.scene.add(this.spes)

      // let tween = new TWEEN.Tween(sprite.position).to({x: sprite.position.x, y: 100, z: sprite.position.z}, 5000).start()
      // tween.repeat(Infinity)
    }
  }

  initMesh22BB() {
    // this.addSP()
    var loader = new FBXLoader();

    const map = new THREE.TextureLoader().load('/textures/jt2.png')
    const material = new THREE.SpriteMaterial({ map: map })

    // let path = require('../../../../public/model/fuian1.FBX')
    loader.load('/model/libin/JMX.FBX', (object) => {
      console.log(object.uuid)
      for (let c of object.children) {
        //  || c.name == 'Object015'
        if (c.name == 'Cylinder322' || c.name == 'NONE-DC_Shell_wk' || c.name == 'Line008' || c.name == '3-DC_Shell' || c.name == 'Cylinder342' || c.name == 'Cylinder333' || c.name == 'Cylinder296' || c.name == 'Object039' || c.name == 'Box002' || c.name == 'Rectangle098' || c.name == 'Line012') {
          c.material.map = null
          c.material.transparent = true
          c.material.opacity = 0.3
        }
        if (c.name == 'ShuiMo') {
          let shuimo = []
          let shuiwa = []
          let outter = null
          for (let d of c.children) {
            if (d.name.indexOf('ShuiMo') >= 0) {
              shuimo.push(d)
            }
            if (d.name.indexOf('ShuiWa') >= 0) {
              shuiwa.push(d)
            }
            if (d.name == 'Object040') {
              outter = d
            }
          }

          outter.transparent = true
          // outter.opacity = 0.1
          // outter.visible = false
          // 计算外边框大小
          outter.geometry.computeBoundingBox()
          let outterSize = new THREE.Vector3()
          outter.geometry.boundingBox.getSize(outterSize)

          const sprite = new THREE.Sprite(material)
          let pos = outter.parent.position.clone()

          // pos = pos.add(outter.position)
          pos = pos.multiplyScalar(0.01)
          sprite.position.set(pos.x, pos.y, pos.z)
          console.log(outter.parent.position, outter.position, pos)
          this.scene.add(sprite)
          // this.spes.add(sprite)
          // this.scene.add(this.spes)


          let sm1 = null
          let sw1 = null
          for (let sm of shuimo) {
            if (sm.name == 'ShuiMo01') {
              sm1 = sm
            }
          }
          for (let sw of shuiwa) {
            if (sw.name == 'ShuiWa01') {
              sw1 = sw
            }
          }
          //////////////////
          // for (let sm of shuimo) {
          //   if (sm.name != 'ShuiMo01') {
          //     sm.position.copy(sm1.position)
          //   }
          // }
          // for (let sw of shuiwa) {
          //   if (sw.name != 'ShuiWa01') {
          //     sw.position.copy(sw1.position)
          //   }
          // }
          let realZHeight = outterSize.z - 130
          // console.log(shuimo)
          // console.log(shuiwa)
          let realCount = shuimo.length / 20
          let perAddZ = realZHeight / realCount
          // for (let i = 0;i < realCount;i++) {
          //   let sm = shuimo[i]
          //   new TWEEN.Tween(sm.position).to({x: sm.position.x, y: sm.position.y, z: sm.position.z - perAddZ * i}, 5000).start()
          //   let sw = shuiwa[i]
          //   if (i > 0) {
          //     // sw.position.setZ(sm.position.z - perAddZ / 2)
          //     new TWEEN.Tween(sw.position).to({x: sw.position.x, y: sw.position.y, z: sm.position.z - perAddZ * i - perAddZ / 2}, 5000).start()
          //   } else {
          //     // sw.position.setZ(sw.position.z - perAddZ / 2)
          //     new TWEEN.Tween(sw.position).to({x: sw.position.x, y: sw.position.y, z: sw.position.z - perAddZ / 2}, 5000).start()
          //   }
          // }

        }
      }
      let scale = 0.01;
      object.scale.set(scale, scale, scale)
      this.scene.add(object)
      this.object = object
      ///
      // this.focusFun(object, 0.001)
    })
  }


  __gm(ma, v3, papos) {
    ma.onBeforeCompile = (s) => {
      s.uniforms.pos = { value: 0.5 }
      s.uniforms.center = { value: v3 }
      s.uniforms.papos = { value: papos }
      s.vertexShader = `
      #define PHONG
      varying vec3 vViewPosition;
      varying vec3 vPosition;
      attribute vec3 displacement;
      varying vec3 testpos;
      #ifndef FLAT_SHADED
        varying vec3 vNormal;
      #endif
      #include <common>
      #include <uv_pars_vertex>
      #include <uv2_pars_vertex>
      #include <displacementmap_pars_vertex>
      #include <envmap_pars_vertex>
      #include <color_pars_vertex>
      #include <fog_pars_vertex>
      #include <morphtarget_pars_vertex>
      #include <skinning_pars_vertex>
      #include <shadowmap_pars_vertex>
      #include <logdepthbuf_pars_vertex>
      #include <clipping_planes_pars_vertex>
      void main() {
        #include <uv_vertex>
        #include <uv2_vertex>
        #include <color_vertex>
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
      #ifndef FLAT_SHADED
        vNormal = normalize( transformedNormal );
      #endif
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        vViewPosition = - mvPosition.xyz;
        #include <worldpos_vertex>
        #include <envmap_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>
        // vPosition = vViewPosition;
        vPosition = position;
        testpos = displacement;
      }
      `
      s.fragmentShader = `
      #define PHONG
      uniform vec3 diffuse;
      uniform vec3 emissive;
      uniform vec3 specular;
      uniform float shininess;
      uniform float opacity;
      uniform float pos;
      varying vec3 vPosition;
      uniform vec3 center;
      uniform vec3 papos;
      varying vec3 testpos;
      #include <common>
      #include <packing>
      #include <dithering_pars_fragment>
      #include <color_pars_fragment>
      #include <uv_pars_fragment>
      #include <uv2_pars_fragment>
      #include <map_pars_fragment>
      #include <alphamap_pars_fragment>
      #include <aomap_pars_fragment>
      #include <lightmap_pars_fragment>
      #include <emissivemap_pars_fragment>
      #include <envmap_common_pars_fragment>
      #include <envmap_pars_fragment>
      #include <cube_uv_reflection_fragment>
      #include <fog_pars_fragment>
      #include <bsdfs>
      #include <lights_pars_begin>
      #include <lights_phong_pars_fragment>
      #include <shadowmap_pars_fragment>
      #include <bumpmap_pars_fragment>
      #include <normalmap_pars_fragment>
      #include <specularmap_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>
      // 计算距离
      float distanceTo(vec2 src, vec2 dst) {
        float dx = src.x - dst.x;
        float dy = src.y - dst.y;
        float dv = dx * dx + dy * dy;
        return sqrt(dv);
      }

      void main() {
        #include <clipping_planes_fragment>
        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;
        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <specularmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>
        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>
        #include <aomap_fragment>
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        #include <envmap_fragment>
        //vec2 abspos = papos.xy + vPosition.xy;
        //float length = distanceTo(center.xy, abspos);
        if (testpos.x > 1.0) {
          outgoingLight = outgoingLight + vec3(0.0, 1.0, 1.0);
        }
        gl_FragColor = vec4( outgoingLight, diffuseColor.a );
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>
      }
      `
    }
  }
  __tyangguang(obj, v3) {
    if (obj.children) {
      for (let c of obj.children) {
        if (c.material && c.material.name == 'yangguang') {
          let arr = []
          console.log(c.scale.x)
          for(let i=0;i<c.geometry.attributes.position.count;i++) {
            let x = c.geometry.attributes.position.getX(i) * c.scale.x + obj.position.x
            let y = c.geometry.attributes.position.getY(i)
            let z = c.geometry.attributes.position.getZ(i)
            arr.push(x * 0.21)
            arr.push(y)
            arr.push(z)
          }
          const displacement = new Float32Array(arr)
          c.geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3))
          // let pos = c.geometry
          // c.geometry.applyMatrix4(c.matrixWorld)
          this.__gm(c.material, v3, c.position)
        }
        this.__tyangguang(c, v3)
      }
    }
  }

  initMesh22() {
    var loader = new FBXLoader();

    const map = new THREE.TextureLoader().load('/textures/jt2.png')
    const material = new THREE.SpriteMaterial({ map: map })

    loader.load('/model/sanqi/Industrial_final.FBX', (object) => {
      let scale = 0.21;
      object.scale.set(scale, scale, scale)
      this.scene.add(object)
      this.object = object

      console.log(this.object)
      let box = new THREE.Box3().setFromObject(object)
      let v3 = box.getCenter()
      // console.log(v3)
      for (let c of object.children) {
        if (c.name == '7#') {
         
        }
      }
      this.__tyangguang(object, v3)
    })
  }

  initCurve() {
    let keyPoints = []
    keyPoints.push(new THREE.Vector3(-10, 0, 0))
    keyPoints.push(new THREE.Vector3(0, 10, 5))
    keyPoints.push(new THREE.Vector3(10, 0, 0))

    let pointCurve = new THREE.CatmullRomCurve3(keyPoints)
    pointCurve.curveType = 'catmullrom'
    pointCurve.tension = 0
    pointCurve.closed = false

    const geometry = new THREE.TubeGeometry( pointCurve, 20, .2, 8, false )
    const map = new THREE.TextureLoader().load('/textures/jt3.png')
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(26, 4)
    const material = new THREE.MeshBasicMaterial( { transparent: true, side: THREE.FrontSide, map: map,  } )
    this.gmap = map
    // const shaderMaterial = new THREE.ShaderMaterial({
    //   uniforms: this.uniforms,
    //   vertexShader: `
    //   varying vec2 vUv;
		// 	void main() {
    //     vUv = uv;
		// 		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    //     gl_Position = projectionMatrix * mvPosition;
		// 	}`,
    //   fragmentShader: `
    //   varying vec2 vUv;
    //   uniform sampler2D jt; 
    //   uniform float time; 
		// 	void main() {
    //     // vec2 uu = normalize(vUv);
    //     // float x = smoothstep(0.0, 3.14 / 2.0, vUv.y + time);
    //     float x = fract(vUv.x * 5.0 + time);
    //     vec4 c = texture2D( jt, vec2(x, vUv.y) );
    //     float a = c.a;
		// 		gl_FragColor = vec4(c.r, c.g, c.b, a);
		// 	}`,
    //   side: THREE.DoubleSide,
    //   transparent: true
    // })

    const mesh = new THREE.Mesh( geometry, material )
    this.scene.add( mesh )
  }

  Initialize() {
    // this.getMaterial()
    // this.initCurve()
    // this.initMesh22()
    this.initGLTF()
  }
}
