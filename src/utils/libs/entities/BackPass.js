import * as THREE from 'three';
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

import Component from '../common/Component'
import { SELECTED_OBJECTS } from "@/api/sceneObjects";
import { PASSTYPE } from '@/utils/libs/common/BackPassType'

export default class BackPassMesh extends Component {
  constructor(scene, renderer, camera, size, initType) {
    super();
    this.renderer = renderer
    this.camera = camera
    this.scene = scene;
    this.name = "BackPassMesh";
    this.sizes = size
    this.initType = initType

    this.outlinePass = null
    this.bloomComposer = null
    this.finalComposer = null
    this.materials = {}
    this.BLOOM_SCENE = 1
  }

  updateSelectedObject(obj) {
    this.outlinePass.selectedObjects = [obj]
  }
  updateSelectedObjects(arr) {
    this.outlinePass.selectedObjects = arr
  }

  initMesh() {
    this.initBackPass()
  }

  Initialize() {
    this.initMesh()
  }
  Update(t) {
    this.StepBackPass()
  }

  StepBackPass() {
    if (this.initType === PASSTYPE.FULL) {
      this.scene.traverse((obj) => {
        this.darkenNonBloomed(obj)
      });
      // 2. 用 bloomComposer 产生辉光
      if (this.bloomComposer) {
        this.bloomComposer.render();
      }
      // 3. 将转成黑色材质的物体还原成初始材质
      this.scene.traverse((obj) => {
        this.restoreMaterial(obj)
      });
    }
    // 4. 用 finalComposer 作最后渲染
    if (this.finalComposer) {
      this.finalComposer.render();
    }
  }

  // 将场景中除了辉光物体外的物体材质转成黑色
  darkenNonBloomed(obj) {
    // layer的test方法是判断参数中的图层和自己的图层是否是同一个图层
    // 如果obj是几何体，且不在bloomLayer图层，说明不是辉光物体
    if (
      (obj.isMesh || obj.isSprite) &&
      this.bloomLayer && this.bloomLayer.test(obj.layers) === false
    ) {
      // 如果是精灵几何体，需要转成黑色的精灵材质，做特殊处理
      if (obj.isSprite) {
        this.materials[obj.uuid] = obj.material; // 在materimals变量中保存原先的材质信息
        obj.material = new THREE.SpriteMaterial({
          color: "#000",
        });
        // 其他几何体可以转成普通的黑色材质
      } else {
        this.materials[obj.uuid] = obj.material; // 在materimals变量中保存原先的材质信息
        obj.material = this.darkMaterial;
      }
    }
  }

  // 将场景中材质转成黑色的物体还原
  restoreMaterial(obj) {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid]; // 还原材质
      delete this.materials[obj.uuid]; // 内存中删除
    }
  }

  initBackPass() {
    this.finalComposer = new EffectComposer(this.renderer);

    if (this.initType === PASSTYPE.FULL) {
      this.bloomLayer = new THREE.Layers();
      this.bloomLayer.set(this.BLOOM_SCENE);
      this.darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.sizes.width, this.sizes.height),
        1.5,
        0.4,
        0.85
      );
      bloomPass.threshold = 0;
      bloomPass.strength = 1.4;
      bloomPass.radius = 0.1;

      this.bloomComposer = new EffectComposer(this.renderer);
      var renderPass = new RenderPass(this.scene, this.camera);
      this.bloomComposer.addPass(renderPass);
      this.bloomComposer.addPass(bloomPass);
      this.bloomComposer.renderToScreen = false;

      /////FINAL
      var finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
          },
          vertexShader: `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`,
          fragmentShader: `uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          vec4 getTexture( sampler2D texelToLinearTexture ) {
            return LinearToLinear( texture2D( texelToLinearTexture , vUv ) );
          }
          void main() {
            gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );
          }`,
          defines: {},
        }),
        "baseTexture"
      );
      finalPass.needsSwap = true;
      this.finalComposer.addPass(renderPass);
      this.finalComposer.addPass(finalPass);

      let FxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = this.renderer.getPixelRatio();
      FxaaPass.material.uniforms["resolution"].value.x =
        1 / (this.sizes.width * pixelRatio);
      FxaaPass.material.uniforms["resolution"].value.y =
        1 / (this.sizes.height * pixelRatio);
      FxaaPass.renderToScreen = true;
      this.finalComposer.addPass(FxaaPass);
      ///外边框
      this.outlinePass = new OutlinePass(
        new THREE.Vector2(this.sizes.width, this.sizes.height),
        this.scene,
        this.camera
      );
      this.finalComposer.addPass(this.outlinePass);
    }
    if (this.initType === PASSTYPE.ONLY_OUTLINE) {
      var renderPass = new RenderPass(this.scene, this.camera);
      this.finalComposer.addPass(renderPass);
      ///外边框
      this.outlinePass = new OutlinePass(
        new THREE.Vector2(this.sizes.width, this.sizes.height),
        this.scene,
        this.camera
      );
      this.outlinePass.visibleEdgeColor = new THREE.Color(0xff0000)
      // this.outlinePass.pulsePeriod = 2
      this.finalComposer.addPass(this.outlinePass);
    }
  }
}
