<template>
<div>
  <div class="public-body">
    <div class="btn-nor" @click="handleStartDrawLine">{{ this.sceneMode.TYPE == 'DRAWLINE' ? '停止画线' : '开始画线' }}</div>
    
    <div class="tables">
      <div v-if="this.sceneMode.TYPE == 'DRAWLINE'" class="btn-nor btn-small" @click="handleAddLine()">添加线</div>
      <table border="0" width="100%">
        <thead>
          <tr>
            <th>序号</th>
            <th>名称</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item,inx in drawLineModel.collection" :key="item.id" 
            :class="{sel: (drawLineModel.curChooseLineMod && drawLineModel.curChooseLineMod.id == item.id)}">
            <td style="width: 50px;">{{ inx + 1 }}</td>
            <td>{{ item.name }}</td>
            <td style="width: 120px;">
              <a class="btn" @click="handlePrev(item)">预览</a>
              <a class="btn">编辑</a>
              <a class="btn">删除</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
  <div class="tip-body" v-if="sceneMode.TYPE == 'DRAWLINE'">{{ tipTxt }}</div>
</div>
</template>

<script>
import * as THREE from 'three'
import { LastEngineShell } from '@/utils/lib/Final_LastEngineShell.min.js'

import { Ammo, AmmoHelper } from "@/utils/libs/common/AmmoLib"
import EntityManager from "@/utils/libs/common/EntityManager"
import Entity from "@/utils/libs/common/Entity"
import PlayerControls from "@/utils/libs/PlayerControls"
import PlayerPhysics from "@/utils/libs/PlayerPhysics"
import GroundMesh from "@/utils/libs/entities/GroundMesh"
import Line from '@/utils/libs/entities/line'
import TransformControl from '@/utils/libs/entities/transform-control'
export default {
  data() {
    return {
      threeEngineShell: null,
      threeEngine: null,
      renderer: null,
      scene: null,
      camera: null,
      controls: null,
      tween: null,
      manager: null,
      mixer: null,
      clock: null,
      clockTag: null,
      animationFrame: null,

      visualFloor: null,

      physicsWorld: null,
      entityManager: null,
      playerControl: null,

      sceneMode: {
        TYPE: 'NONE'
      },
      drawLineModel: {
        collection: [],
        curChooseLineMod: null,
        curLineCube: null
      },
      raycaster: null,
      transformControl: null,

      tipTxt: '',
      datatable: [],
      
    }
  },
  mounted() {
    AmmoHelper.Init(() => {
      this.initInfo()
      this.initMain()

      this.SetupPhysics()
      this.initPhysicsWordEntity()
      
      this.initTransform()
      this.initDrawLine()
    })
  },
  methods: {
    initMain() {
      this.initEntity()
      window.addEventListener('resize', () => {
        this.onWindowResize()
      })
      window.addEventListener('dblclick', (event) => {
        this.onMouseDbClick(event)
      }, false)
      window.addEventListener('click', (event) => {
        this.onMouseClick(event)
      }, false)
      window.addEventListener('contextmenu', (event) => {
        this.onRightClick(event)
      })
      window.addEventListener('keyup', (event) => {
        this.onKeyUp(event)
      })
    },
    initInfo() {
      this.threeEngineShell = new LastEngineShell
      this.threeEngine = this.threeEngineShell.threeEngine
      this.renderer = this.threeEngine.renderer
      this.scene = this.threeEngine.scene
      this.camera = this.threeEngine.camera
      this.controls = this.threeEngine.controls
      this.tween = this.threeEngine.tween
      this.manager = this.threeEngine.manager
      this.mixer = this.threeEngine.mixer
      this.clock = this.threeEngine.clock
      this.clockTag = this.threeEngine.clockTag
      this.animationFrame = this.threeEngine.animationFrame
      this.raycaster = new THREE.Raycaster()

      console.log(this.controls)
    },
    initEntity() {
      let url_industrialPark_Model = '/model/Industrial_final.FBX';
      this.threeEngine.initLoader("FBX", url_industrialPark_Model, "mainGroup");

      let url_effectFinal_Model = '/model/effectFinal.last';
      this.threeEngine.initLoader("last", url_effectFinal_Model, "effectGroup");

      this.manager.onLoad = () => {
        this.threeEngineShell.lightComponent()

        this.threeEngineShell.sceneComponent()

        let optimization = this.threeEngineShell.optimizationComponent()
        optimization.pre_autoRotation(false) // 场景自动旋转：开启true，关闭false。
        optimization.opt_insideBuild_visible(false) // 当展示总园区场景时，减少渲染开销，可以隐藏建筑内无关紧要的柱子等模型，用来提高性能：开启true，关闭false。
        optimization.pre_Interaction() // 交互辅助方法。请勿以更改全局对象属性编写交互程序，如若实无解决办法，需执行该函数，以避免BUG的产生。
        optimization.opt_realWater_visible(false) // 具备折射与反射水面对象：开启true，关闭false，默认关闭，开销较大，需电脑配置良好。

        // 注：所有关于孪生三维渲染或交互，在此处编程。与原生THREE.js使用方式一致
        this.controls.update()

        /** LastMoonlight：画面渲染
         * - animate() - 画面渲染、运行动画
         */
        this.animate()
      }
    },
    animate() {
      requestAnimationFrame(() => {
        this.animate()
      })
      const deltaTime = this.clock.getDelta()
      if (this.mixer) this.mixer.update(deltaTime)
      this.tween.update()
      // this.controls.update()
      this.renderer.render(this.scene, this.camera);
      this.animationFrame.forEach(func => {
        func(this.clock)
      })
      // 物理
      if (this.entityManager) {
        this.entityManager.Update(deltaTime);
      }
      if (this.physicsWorld) {
        this.physicsWorld.stepSimulation(deltaTime, 10);
      }
    },
    onWindowResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    },
    onKeyUp(event) {
      // 删除按键
      if (event.keyCode == 46) {
        if (this.sceneMode.TYPE = 'DRAWLINE') {
          if (this.drawLineModel.curChooseLineMod && this.drawLineModel.curChooseLineMod.lineControl) {
            if (this.drawLineModel.curLineCube) {
              this.transformControl.Reset()
              this.drawLineModel.curChooseLineMod.lineControl.DeleteInfo(this.drawLineModel.curLineCube)
              this.drawLineModel.curLineCube = null
            }
          }
        }
      }
    },
    onRightClick(event) {
      if (this.sceneMode.TYPE == 'DRAWLINE') {
        let pos = this.screenPointToThreeCoords(event.clientX, event.clientY)
        if (this.drawLineModel.curChooseLineMod && this.drawLineModel.curChooseLineMod.lineControl) {
          this.drawLineModel.curChooseLineMod.lineControl.AddInfo(pos)
        }
      }
    },
    onMouseDbClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      this.chooseObjects(mouse.x, mouse.y)

      if (this.clockTag) {
        this.clockTag = false
        this.threeEngineShell.eventComponent().weatherChange(mouse, "dx_road002", "groundWater", true)
      }
      //降频处理，请勿修改！
      var timer = setTimeout(() => {
        this.clockTag = true
        if (timer) {
          clearTimeout(timer)
        }
      }, 10000)
    },
    onMouseClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      this.chooseObjects(mouse.x, mouse.y)

      if (this.clockTag) {
        this.clockTag = false
        this.threeEngineShell.eventComponent().weatherChange(mouse, "dx_road002", "groundWater", true)
      }
    },
    chooseObjects(x, y) {
      var pointer = new THREE.Vector3()
      pointer.set(x, y, 0.5)
      this.raycaster.setFromCamera(pointer, this.camera)
      let arrCubes = []
      for (let c of this.drawLineModel.collection) {
        arrCubes.push(c.lineControl.object)
      }
      const intersects = this.raycaster.intersectObjects(arrCubes, true)
      if (intersects.length > 0) {
        const intersect = intersects[0]
        console.log(intersect)
        this.handleChooseCurrent(intersect)
      } else {
        
      }
    },
    ////////// 物理引擎
    SetupPhysics() {
      // Physics configuration
      const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
      const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
      const broadphase = new Ammo.btDbvtBroadphase()
      const solver = new Ammo.btSequentialImpulseConstraintSolver()
      this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration
      )
      this.physicsWorld.setGravity(new Ammo.btVector3(0.0, -9.81, 0.0));
      const fp = Ammo.addFunction((world, timeStep) => {
        // TODO
        this.entityManager.PhysicsUpdate(world, timeStep);
      })
      this.physicsWorld.setInternalTickCallback(fp);
      this.physicsWorld
        .getBroadphase()
        .getOverlappingPairCache()
        .setInternalGhostPairCallback(new Ammo.btGhostPairCallback())
    },
    initPhysicsWordEntity() {
      this.entityManager = new EntityManager()
      const playerEntity = new Entity()
      playerEntity.position.set(0, 0, 0)
      playerEntity.SetName("Player")
      playerEntity.AddComponent(new PlayerPhysics(this.physicsWorld, Ammo))
      let con = new PlayerControls(this.camera, this.renderer, this.controls)
      playerEntity.AddComponent(con)
      this.entityManager.Add(playerEntity)

      this.playerControl = con

      const groundEntity = new Entity()
      groundEntity.SetName("Ground")
      let gmesh = new GroundMesh(this.physicsWorld, this.scene)
      groundEntity.AddComponent(gmesh)
      this.entityManager.Add(groundEntity)
      
      this.entityManager.EndSetup()

      this.visualFloor = gmesh.mesh
    },

    /////// 画线
    initTransform() {
      let con = new TransformControl(this.camera, this.renderer, this.controls, this.sceneMode)
      con.eventChange = () => {
        if (this.drawLineModel.curChooseLineMod && this.drawLineModel.curChooseLineMod.lineControl) {
          if (this.drawLineModel.curLineCube) {
            this.drawLineModel.curChooseLineMod.lineControl.UpdateInfo(this.drawLineModel.curLineCube)
          }
        }
      }
      con.Init()
      this.scene.add(con.object)
      this.transformControl = con
    },
    initDrawLine() {
      // let line = new Line()
      // line.Init()
      // this.scene.add(line.object)
    },

    //////// 基本方法
    screenPointToThreeCoords(clientX, clientY) {
      var pointer = new THREE.Vector3()
      var pos = new THREE.Vector3()
      pointer.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1, 0.5)
      this.raycaster.setFromCamera(pointer, this.camera)
      const intersects = this.raycaster.intersectObjects([this.visualFloor])
      if (intersects.length > 0) {
        const intersect = intersects[0]
        pos = intersect.point
      }
      return pos
    },
    focusObject(ev) {
      let tar = new THREE.Vector3()
      ev.getWorldPosition(tar)
      let box = new THREE.Box3().setFromObject(ev)
      let cen = box.getCenter(tar)
      //////
      let sphere = new THREE.Sphere()
      let radius = box.getBoundingSphere(sphere).radius
      let delta = new THREE.Vector3()
      delta.set(0, 0, 1)
      delta.applyQuaternion(this.camera.quaternion)
      delta.multiplyScalar(radius + 50)
      let cp = new THREE.Vector3().copy(cen).add(delta)
      
      this.controls.target.copy(cen)
      this.camera.position.copy(cp)
    },

    //////// 事件
    handleStartDrawLine() {
      if (this.sceneMode.TYPE == 'DRAWLINE') {
        this.sceneMode.TYPE = 'NONE'
        this.tipTxt = ''
        this.controls.mouseButtons.RIGHT = 2
        //
        this.transformControl.Reset()
        this.drawLineModel.curLineCube = null
        this.drawLineModel.curChooseLineMod = null
      } else {
        this.sceneMode.TYPE = 'DRAWLINE'
        this.tipTxt = '右键点击添加点，CTRL+鼠标左键移动场景'
        this.controls.mouseButtons.RIGHT = -1
      }
    },
    handleAddLine() {
      let line = new Line()
      line.Init()
      this.scene.add(line.object)
      let mod = { id: THREE.MathUtils.generateUUID(), name: '名称1', lineControl: line }
      this.drawLineModel.collection.push(mod)
      this.drawLineModel.curChooseLineMod = mod
      this.drawLineModel.curLineCube = null

      this.focusObject(mod.lineControl.object)
    },
    handleChooseCurrent(intersect) {
      if (intersect.object.userData && intersect.object.userData.parent) {
        let lineControl = intersect.object.userData.parent
        let one = this.drawLineModel.collection.find((v) => { return v.lineControl.uuid == lineControl.uuid })
        if (one) {
          this.transformControl.Choose(intersect.object)
          this.drawLineModel.curLineCube = intersect.object
          this.drawLineModel.curChooseLineMod = one
        }
      }
    },
    handlePrev(mod) {
      const geometry = new THREE.BoxGeometry(3, 3, 3)
      const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
      const cube = new THREE.Mesh(geometry, material)
      this.scene.add(cube)
      this.goAnimate(mod.lineControl, cube)
    },
    goAnimate(lineControl, mesh) {
      let curve = lineControl.curve

      let percent = { n: 0 }
      new this.tween.Tween(percent).to({ n: 0.99 }, 5000).onUpdate(() => {
        let pos = curve.getPointAt(percent.n)
        let nextPos = curve.getPointAt(percent.n + 0.01)

        this.camera.position.copy(pos)
        //创建一个4维矩阵，旋转角度
        let carMesh = this.camera
        let mtx = new THREE.Matrix4()
        mtx.lookAt(carMesh.position.clone(), nextPos, carMesh.up)
        let offsetRotate = 0
        mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetRotate, 0)))
        let toRot = new THREE.Quaternion().setFromRotationMatrix(mtx)
        carMesh.quaternion.slerp(toRot, 0.2)
      }).start()
    }
  }
}
</script>

<style lang="scss" scoped>
.public-body{
  position: absolute;right: 50px;top: 50px;
}
.tip-body{
  position: absolute;width: 50%;text-align: center;
  left: 50%;margin: 0 0 0 -25%;
  background: rgba(0, 0, 0, 0.3);color: #fff;font-size: 14px;
  padding: 10px 0;
}
.btn-nor{
  width: 150px;height: 40px;line-height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border: solid 1px #000;color: #fff;font-size: 18px;
  text-align: center;cursor: pointer;display: inline-block;
  &:hover{
    background: rgba(0, 0, 0, 0.6);
  }
  &.btn-small{
    width: 80px;height: 25px;line-height: 25px;
    font-size: 12px;
  }
}
.tables{
  width: 350px;
  margin: 20px 0 0 0;
  text-align: right;
  table{
    margin: 10px 0 0 0;
    border-collapse: collapse;
  }
  th{
    border: solid 1px #000;
    background: rgba(0, 0, 0, 0.6);
    height: 30px;line-height: 30px;
    color: #fff;font-size: 14px;
    text-align: center;
  }
  td{
    border: solid 1px #000;
    background: rgba(0, 0, 0, 0.3);
    height: 30px;line-height: 30px;
    color: #fff;font-size: 14px;
    text-align: center;
    .btn{
      color: rgb(18, 153, 231);
      margin: 0 5px;
      cursor: pointer;
      &:hover{
        color: #fff;
      }
    }
  }
  tr:hover{
    td{
      background: rgba(0, 0, 0, 0.6);
    }
  }
  tr.sel{
    td{
      background: rgba(0, 0, 0, 0.9);
    }
  }
}
</style>
