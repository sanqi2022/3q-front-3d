<template>
<div v-if="lineViewModel">
  <div class="public-body" v-if="editMode">
    <div class="btn-nor" @click="handleStartDrawLine" v-if="currentRoleAdmin">{{ lineViewModel.isDrawingMode ? '关闭线路' : '编辑线路' }}</div>
    
    <div class="tables">
      <div v-if="lineViewModel.isDrawingMode && currentRoleAdmin" class="btn-nor btn-small" @click="handleAddLine()">添加线</div>
      <table border="0" width="100%">
        <thead>
          <tr>
            <th>序号</th>
            <th>名称</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item,inx in lineViewModel.group.children" :key="item.id" 
            :class="{sel: (lineViewModel.curlineControl && lineViewModel.curlineControl.uuid == item.userData.parent.uuid)}">
            <td style="width: 50px;">{{ inx + 1 }}</td>
            <td>{{ item.name }}</td>
            <td style="width: 120px;">
              <a class="btn" @click="handlePrev(item.userData.parent)">查看</a>
              <a class="btn" @click="handleEditLine(item.userData.parent.object, item.name)" v-if="currentRoleAdmin">编辑</a>
              <a class="btn" @click="handleDeleteLine(item.userData.parent)" v-if="currentRoleAdmin">删除</a>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="btn-nor btn-small" style="margin-top: 15px;" v-if="currentRoleAdmin" @click="handleSaveRoute">保存</div>
    </div>

  </div>
  
  <div class="btn-nor abs" style="right: 50%;margin-right: -207px;bottom: 50px;" v-if="showBtnEdit && !editMode && !isVisitorPage" @click="handleGoVisitor">参观者</div>
  <div class="btn-nor abs" style="right: 50%;margin-right: -367px;bottom: 50px;" v-if="!editMode" @click="handleMeasureLength">测距</div>
  <div class="tip-body" v-if="measureViewModel.isDrawingMode">右键添加点位，双击暂停编辑，CTRL+鼠标左键移动屏幕</div>
  
  <img v-show="panelView.p1.show" class="v-panel" src="@/assets/panel.png" />
  <img v-show="panelView.p2.show" class="v-panel" src="@/assets/panel2.png" />

  <edit-line-name ref="refLineName" @eventSave="handleSaveLine"></edit-line-name>
  <div class="tip-body" v-if="editMode && lineViewModel.isDrawingMode && currentRoleAdmin">{{ tipTxt }}，<b>{{ (lineViewModel.curlineControl ? `当前编辑的线路：${lineViewModel.curlineControl.object.name}` : '没有选中线路') }}</b></div>
  <div class="tip-body" style="top: 137px;border-top: solid 1px #fff;" v-if="editMode && lineViewModel.isDrawingMode && lineViewModel.curlineControl && currentRoleAdmin">
    <span class="point" v-for="item,ix in lineViewModel.curlineControl.groupPoints.children" :key="ix"
    :class="{ sel: (lineViewModel.curlineCube && lineViewModel.curlineCube.uuid == item.uuid) }" @click="handleChooseCube(item)">{{ '点-' + (ix + 1) }}</span>
  </div>
  <!-- <div class="tip-body" style="top: 182px;border-top: solid 1px #fff;" v-if="lineViewModel.isDrawingMode && lineViewModel.curlineControl && lineViewModel.curlineCube">
    <div class="tip-form">
      <div class="fl">
        <el-radio v-model="lineViewModel.curlineCube.userData.isPausePoint" :label="true">暂停点</el-radio>
        <el-radio v-model="lineViewModel.curlineCube.userData.isPausePoint" :label="false">非暂停点</el-radio>
      </div>
    </div>
  </div> -->
  <div v-if="!sceneMode.IsPlaying && showBtnEdit && !isVisitorPage" class="btn-edit-line">
    <img src="@/assets/btn_edit.png" @click="handleHideEditLines" width="80px" v-if="editMode" />
    <img src="@/assets/btn_editn.png" @click="handleShowEditLines" width="80px" v-else />
  </div>

  <div v-if="sceneMode.IsPlaying">
    <div class="nor-button" v-if="!sceneMode.IsWalking" @click="handlePause"><span>{{ sceneMode.IsPause ? '继续漫游' : '暂停漫游' }}</span></div>

    <div class="sml-map-control" v-if="!sceneMode.IsWalking">
      <div class="btn" @click="handleSpeed(0.5)"><span>0.5X</span></div>
      <div class="btn" @click="handleSpeed(1.0)"><span>1.0X</span></div>
      <div class="btn" @click="handleSpeed(1.5)"><span>1.5X</span></div>
      <div class="btn" @click="handleSpeed(2.0)"><span>2.0X</span></div>
      <div class="btn" @click="handleFree()"><img src="../assets/view.png" /></div>
    </div>
    <div class="small-map" v-if="!sceneMode.IsWalking">
    </div>
  </div>

  <div class="video-panel" :class="{'xfq': visualDialog == 1}" v-if="visualDialog > 0">
    <div class="close" @click="handleCloseDialog"></div>
  </div>
</div>
</template>

<script>
import EditLineName from './components/edit-line-name.vue'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import { LastEngineShell } from '@/utils/lib/Final_LastEngineShell.min.js'

import { Ammo, AmmoHelper } from "@/utils/libs/common/AmmoLib"
import EntityManager from "@/utils/libs/common/EntityManager"
import Entity from "@/utils/libs/common/Entity"
import PlayerControls from "@/utils/libs/PlayerControls"
import PlayerPhysics from "@/utils/libs/PlayerPhysics"
import GroundMesh from "@/utils/libs/entities/GroundMesh"
import LineVm from '@/utils/libs/viewmodel/lineVm'
import TransformControl from '@/utils/libs/entities/transform-control'
import Billboard from '@/utils/libs/entities/billboard'

import MeasureVm from '@/utils/libs/viewmodel/measureVm'

import { deleteRoute, saveRoute, getRoutes } from '@/api/route'
import { setToken } from '@/utils/auth'
export default {
  components: {
    EditLineName
  },
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

      transformControl: null,
      lineViewModel: null,
      measureViewModel: null,

      sceneMode: {
        TYPE: 'NONE',
        IsPlaying: false,
        IsWalking: false,
        IsPause: false
      },
      raycaster: null,

      visualDialog: false,
      allEquipMeshes: [],

      tipTxt: '右键点击添加点，CTRL+鼠标左键移动场景',
      datatable: [],
      
      buildLabel: null,

      editMode: false,
      measureMode: false,

      panelView: {
        p1: { show: false },
        p2: { show: false }
      },

      otherClickGroup: [],

      smlmapCamera: null,
      smlSize: {
        width: 400, height: 300
      },

      enterPlane: null,
      spriteScale: 1,
      spriteScaleStep: 0.01,

      showBtnEdit: false,

      originPos: {"rotation":{"x":-1.5062798473909358,"y":1.104121330786932,"z":1.498580429942209},"quaternion":{"x":-0.16576780160736312,"y":0.6767698996867986,"z":0.16047104467067103,"w":0.6991084198108944},"position":{"x":396.09073275327444,"y":144.82336766879604,"z":-8.995198044442512},"target":{"x":80.17638585717356,"y":-14,"z":-19.256163191051026}},

      curMainRoute: 0,
      currentRoleAdmin: false,

      isVisitorPage: false
      //{"rotation":{"x":-1.0748053857181195,"y":1.047663278967984,"z":1.0124486353422602},"quaternion":{"x":-0.1793215566048606,"y":0.5907316751576629,"z":0.136735348138312,"w":0.7747149875094232},"position":{"x":381.420478414056,"y":148.2364490300042,"z":130.3621690614334},"target":{"x":61.57393782841948,"y":-14,"z":42.57468155588987}}
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
      this.initMeasure()
      
    })
    const loader = new THREE.ImageLoader()
    loader.load('/3d/textures/lbl.png', (img) => {
      this.buildLabel = img
    })
    ////
    window.addEventListener('message', (message) => {
      if (message.data == '/sq/park' || message.data == '/sq/prev' || message.data == '/visitor') {
        this.showBtnEdit = true
        if (message.data == '/visitor') {
          this.isVisitorPage = true
        } else {
          this.isVisitorPage = false
        }
      } else if (message.data && message.data.indexOf('@TOKEN@') >= 0) {
        let tokenstr = message.data.replace('@TOKEN@', '')
        let arr = tokenstr.split('#')
        if (arr.length > 1) {
          setToken(arr[0])
          this.currentRoleAdmin = arr[1] == 'admin'
        }
      } else {
        this.lineViewModel.Reset()
        this.measureViewModel.Reset()
        this.transformControl.Reset()
        this.showBtnEdit = false
        this.handleHideEditLines()
      }
    })
  },
  methods: {
    showVideoDialog(x, y) {
      var pointer = new THREE.Vector3()
      pointer.set(x, y, 0.5)
      this.raycaster.setFromCamera(pointer, this.camera)
      
      const intersects = this.raycaster.intersectObjects(this.allEquipMeshes)
      
      if (intersects.length > 0) {
        const intersect = intersects[0]
        if (intersect.object.name.indexOf('消防栓') >= 0) {
          this.visualDialog = 1
        } else if (intersect.object.name.indexOf('枪机') >= 0) {
          this.visualDialog = 2
        }
      }
      // this.visualDialog = true
    },
    handleCloseDialog(ev) {
      ev.stopPropagation()
      this.visualDialog = 0
    },
    initVideoLoc() {
      let arr = []
      for (let c of this.scene.children[7].children) {
        if (c.name.indexOf('消防栓') >= 0) {
          arr.push(c)
        }
        if (c.name.indexOf('枪机') >= 0) {
          arr.push(c)
        }
      }
      this.allEquipMeshes = arr
    },
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
      this.renderer.setClearAlpha(0)

      this.smlmapCamera = new THREE.PerspectiveCamera(45, this.smlSize.width / this.smlSize.height, 1, 2000)
      this.smlmapCamera.position.copy(this.camera.position)
      this.smlmapCamera.quaternion.copy(this.camera.quaternion)

    },
    initEntity() {
      let url_industrialPark_Model = '/3d/model/Industrial_final_baishebei.FBX';
      this.threeEngine.initLoader("FBX", url_industrialPark_Model, "mainGroup");

      let url_effectFinal_Model = '/3d/model/effectFinal.last';
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

        this.addLocatorBuild()

        this.addEnterPlan()

        this.initVideoLoc()

        /** LastMoonlight：画面渲染
         * - animate() - 画面渲染、运行动画
         */
        this.animate()

        this.backMain()
      }
    },
    addEnterPlan() {
      const geometry = new THREE.PlaneGeometry(10, 10)
      const texture = new THREE.TextureLoader().load('textures/enter.png')
      texture.encoding = THREE.sRGBEncoding
      // texture.rotation = Math.PI / 2
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: texture, transparent: true })
      const plane = new THREE.Mesh(geometry, material)
      plane.name = 'enter'
      plane.position.set(235, 0.3, 3)
      plane.rotation.set(Math.PI / 2, 0, 0)
      this.scene.add(plane)
      this.otherClickGroup.push(plane)

      this.enterPlane = plane
    },
    addLocatorBuild() {
      let group = new THREE.Group()
      for (let s of this.scene.children) {
        if (s.name == 'effectGroup') {
          for (let la of s.children) {
            if (la.name.indexOf('locatorBuildName_') == 0) {
              let arr = la.name.split('_')
              // console.log(la.name)
              if (arr.length > 1) {
                let bill = new Billboard()
                bill.Init(this.buildLabel, la.position, `#${arr[1]}厂房`)
                group.add(bill.object)
              }
            }
            if (la.name == 'spriteLightPole_35') {
              console.log(la.material)
            }
          }
        }
      }
      this.scene.add(group)
    },
    smlRender() {
      this.renderer.setClearColor( 0x222222, 1 )

      this.renderer.clearDepth(); // important!

      this.renderer.setScissorTest( true )

      this.renderer.setScissor( 35, 35, this.smlSize.width, this.smlSize.height )

      this.renderer.setViewport( 35, 35, this.smlSize.width, this.smlSize.height )

      if (!this.sceneMode.IsPlaying) {
        this.smlmapCamera.position.copy(this.camera.position)
        this.smlmapCamera.quaternion.copy(this.camera.quaternion)
      }
      
      // renderer will set this eventually
      // matLine.resolution.set( insetWidth, insetHeight ); // resolution of the inset viewport

      this.renderer.render(this.scene, this.smlmapCamera)
      this.renderer.setScissorTest(false)
    },
    animate() {
      requestAnimationFrame(() => {
        this.animate()
      })
      const deltaTime = this.clock.getDelta()
      if (this.mixer) this.mixer.update(deltaTime)
      // this.tween.update()
      TWEEN.update()
      // this.controls.update()
      ///
      this.renderer.setClearColor(0x000000, 0)
      this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
      this.renderer.render(this.scene, this.camera);

      if (this.enterPlane) {
        this.spriteScale += this.spriteScaleStep
        if (this.spriteScale >= 1.2) {
          this.spriteScaleStep = -0.01
        } 
        if (this.spriteScale <= 0.8) {
          this.spriteScaleStep = 0.01
        }
        this.enterPlane.scale.set(this.spriteScale, this.spriteScale, this.spriteScale)
      }

      if (!this.sceneMode.IsWalking && this.sceneMode.IsPlaying) {
        this.smlRender()
      }
      if (this.lineViewModel) {
        this.lineViewModel.Update()
      }
      
      ///
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
    backMain() {
      // ESC
      this.lineViewModel.StopAnimate()
      this.sceneMode.IsPlaying = false
      this.sceneMode.IsWalking = false
      this.sceneMode.IsPause = false
      this.flyTo(this.originPos)
    },
    onKeyUp(event) {
      // 删除按键
      if (event.keyCode == 46) {
        if (this.currentRoleAdmin) {
          this.lineViewModel.DeleteCurLineCube()
        }
        this.measureViewModel.DeleteCurLineCube()
      } else if (event.keyCode == 27) {
        this.backMain()
        this.lineViewModel.ShowAllLine()
      }
    },
    onRightClick(event) {
      let pos = this.screenPointToThreeCoords(event.clientX, event.clientY)
      if (this.currentRoleAdmin) {
        this.lineViewModel.AddCurLineCube(pos)
      }
      this.measureViewModel.AddCurLineCube(pos)
    },
    onMouseDbClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      this.chooseObjects(mouse.x, mouse.y)
      // 双击取消编辑
      this.measureViewModel.StopEdit()

      // if (this.clockTag) {
      //   this.clockTag = false
      //   this.threeEngineShell.eventComponent().weatherChange(mouse, "dx_road002", "groundWater", true)
      // }
      //降频处理，请勿修改！
      var timer = setTimeout(() => {
        this.clockTag = true
        if (timer) {
          clearTimeout(timer)
        }
      }, 10000)
    },
    printPos() {
      let item = {
        rotation: {
          x: this.camera.rotation._x,
          y: this.camera.rotation._y,
          z: this.camera.rotation._z,
        },
        quaternion: {
          x: this.camera.quaternion._x,
          y: this.camera.quaternion._y,
          z: this.camera.quaternion._z,
          w: this.camera.quaternion._w,
        },
        position: {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        },
        target: {
          x: this.controls.target.x,
          y: this.controls.target.y,
          z: this.controls.target.z,
        }
      }
      console.log(JSON.stringify(item))
    },
    flyTo(target, callback) {
      let start = this.camera
      let selectedObject = start.position;
      new TWEEN.Tween(selectedObject)
        .to(target.position, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.camera.position = selectedObject;
          this.controls.update();
        })
        .onComplete(callback)
        .start();
    },
    onMouseClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      this.printPos()

      this.chooseObjects(mouse.x, mouse.y)
      // TODO:
      this.showVideoDialog(mouse.x, mouse.y)

      if (this.clockTag) {
        this.clockTag = false
        this.threeEngineShell.eventComponent().weatherChange(mouse, "dx_road002", "groundWater", true)
      }
    },
    chooseObjects(x, y) {
      var pointer = new THREE.Vector3()
      pointer.set(x, y, 0.5)
      this.raycaster.setFromCamera(pointer, this.camera)
      
      const intersects = this.raycaster.intersectObjects([this.lineViewModel.group, ...this.otherClickGroup, ...this.measureViewModel.group.children], true)
      
      if (intersects.length > 0) {
        const intersect = intersects[0]
        this.handleChooseCurrent(intersect)
        this.handleEnterScene(intersect)
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
      playerEntity.position.set(235, 0.3, 3)
      playerEntity.SetName("Player")
      playerEntity.AddComponent(new PlayerPhysics(this.physicsWorld, Ammo))
      let con = new PlayerControls(this.camera, this.renderer, this.controls)
      playerEntity.AddComponent(con)
      this.entityManager.Add(playerEntity)

      con.recoverBack = () => {
        this.backMain()
      }
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
        this.lineViewModel.UpdateCurLineCube()
        this.measureViewModel.UpdateCurLineCube()
      }
      con.Init()
      this.scene.add(con.object)
      this.transformControl = con
    },
    async initDrawLine() {
      let lineVm = new LineVm(this.scene, this.camera, this.controls, this.transformControl, (d) => {
        this.panelView.p1.show = false
        this.panelView.p2.show = false
        console.log(d)
        if (d === 0) {
          this.panelView.p1.show = true
        } else if (d === 1) {
          this.panelView.p2.show = true
        }
      })
      lineVm.Init()
      this.lineViewModel = lineVm
      // 默认线路
      let res = await getRoutes({})
      if (res && res.list && res.list.length > 0) {
        let one = res.list[0]
        let ps = JSON.parse(one.value)
        for (let line of ps) {
          this.lineViewModel.AddLineControl(line.name, line.pos)
        }
        this.lineViewModel.HideAllLine()
      }
      // let ps = [{"pos":{"x":0,"y":0,"z":0}},{"pos":{"x":18.393837674276078,"y":0,"z":0}},{"pos":{"x":227.49017043443075,"y":0,"z":4.9976649630186785}},{"pos":{"x":224.70896081610022,"y":0,"z":145.61361637928036},"isPausePoint":true, "type": "num1"},{"pos":{"x":1.4936791878470395,"y":1.1368683772161603e-13,"z":148.22451544959517}},{"pos":{"x":-209.13294440324495,"y":0,"z":144.86887540046024}},{"pos":{"x":-456.9544700369487,"y":0,"z":146.78492740087876}},{"pos":{"x":-659.9510912408374,"y":0,"z":143.94905364415746}},{"pos":{"x":-659.8112549097112,"y":0,"z":-223.58481986965774}},{"pos":{"x":-212.10378442637733,"y":0,"z":-224.2067348645265},"isPausePoint":true, "type": "num2"},{"pos":{"x":201.4458342289864,"y":0,"z":-219.98807182045488}},{"pos":{"x":224.45465918391255,"y":5.684341886080802e-14,"z":-220.58152114319495}},{"pos":{"x":232.23900721663756,"y":5.684341886080802e-14,"z":-20.93375100996718}}]
      // this.lineViewModel.AddLineControl('线路一', ps)
      // this.lineViewModel.HideAllLine()
    },
    ///// 测量///////////////////
    initMeasure() {
      let measure = new MeasureVm(this.scene, this.camera, this.controls, this.transformControl)
      measure.Init()
      this.measureViewModel = measure
    },
    handleMeasureLength() {
      this.measureViewModel.AddLineControl('')
      this.measureViewModel.StartEdit()
    },

    handleShowEditLines() {
      this.editMode = true
      window.parent.postMessage('closePanel', '*')
      if (this.lineViewModel) {
        this.lineViewModel.ShowAllLine()
      }
    },
    handleHideEditLines() {
      this.editMode = false
      if (this.lineViewModel) {
        this.lineViewModel.HideAllLine()
      }
    },
    handleGoVisitor() {
      window.parent.postMessage('goVisitor', '*')
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
      this.lineViewModel.ToggleMode()
      // this.handleStartAnimate()
    },
    handleSaveLine(linename) {
      let mesh = this.lineViewModel.AddLineControl(linename, null)
      this.focusObject(mesh)
    },
    handleChooseCurrent(intersect) {
      if (intersect.object.userData && intersect.object.userData.parent && intersect.object.userData.type != 'cube-txt') {
        if (intersect.object.userData.parent.typeMode == 'draw') {
          if (this.currentRoleAdmin) {
            this.lineViewModel.ChooseLineControlByCube(intersect.object)
          }
        } else if (intersect.object.userData.parent.typeMode == 'measure') {
          this.measureViewModel.ChooseLineControlByCube(intersect.object)
        }
      }
    },
    handlePrev(linecontrol) {
      this.lineViewModel.PrevLineControl(linecontrol)
      ////
      this.lineViewModel.HideAllLine()
      this.sceneMode.IsPlaying = true
      window.parent.postMessage('Prev', '*')
    },
    handleAddLine() {
      this.$refs.refLineName.dy_show(null, '')
    },
    handleEditLine(mesh, linename) {
      this.$refs.refLineName.dy_show(mesh, linename)
    },
    handleDeleteLine(linecontrol) {
      this.transformControl.Reset()
      this.lineViewModel.group.remove(linecontrol.object)
      this.lineViewModel.Reset()
    },
    handleChooseCube(cube) {
      if (cube.userData.parent.typeMode == 'draw') {
        this.lineViewModel.ChooseLineControlByCube(cube)
      } else if (cube.userData.parent.typeMode == 'measure') {
        this.measureViewModel.ChooseLineControlByCube(cube)
      }
    },
    handleStartAnimate() {
      console.log(this.lineViewModel.group.children[0].userData.parent)
      // let ps = [{"pos":{"x":0,"y":0,"z":0}},{"pos":{"x":18.393837674276078,"y":0,"z":0}},{"pos":{"x":227.49017043443075,"y":0,"z":4.9976649630186785}},{"pos":{"x":224.70896081610022,"y":0,"z":145.61361637928036},"isPausePoint":true, "type": "num1"},{"pos":{"x":1.4936791878470395,"y":1.1368683772161603e-13,"z":148.22451544959517}},{"pos":{"x":-209.13294440324495,"y":0,"z":144.86887540046024}},{"pos":{"x":-456.9544700369487,"y":0,"z":146.78492740087876}},{"pos":{"x":-659.9510912408374,"y":0,"z":143.94905364415746}},{"pos":{"x":-659.8112549097112,"y":0,"z":-223.58481986965774}},{"pos":{"x":-212.10378442637733,"y":0,"z":-224.2067348645265},"isPausePoint":true, "type": "num2"},{"pos":{"x":201.4458342289864,"y":0,"z":-219.98807182045488}},{"pos":{"x":224.45465918391255,"y":5.684341886080802e-14,"z":-220.58152114319495}},{"pos":{"x":232.23900721663756,"y":5.684341886080802e-14,"z":-20.93375100996718}}]
      // this.lineViewModel.AddLineControl('TEST', ps)
      this.lineViewModel.PrevLineControl(this.lineViewModel.group.children[0].userData.parent)
    },
    handleEnterScene(intersect) {
      if (intersect && intersect.object && intersect.object.name == 'enter') {
        this.sceneMode.IsPlaying = true
        this.handleStartAnimate()
        window.parent.postMessage('Prev', '*')
        window.parent.postMessage('closePanel', '*')
      }
    },
    handleSpeed(speed) {
      this.lineViewModel.ChangeSpeed(speed)
    },
    handleFree() {
      this.lineViewModel.StopAnimate()
      this.sceneMode.IsPlaying = false
      this.playerControl.GameIn()
      this.sceneMode.IsWalking = true
    },
    handlePause() {
      this.sceneMode.IsPause = !this.sceneMode.IsPause
      this.lineViewModel.TogglePause(this.sceneMode.IsPause)
    },
    async handleSaveRoute() {
      const loading = this.$loading({
        lock: true,
        text: '保存中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      await deleteRoute()
      let arr = this.lineViewModel.Save()
      let tmp = { name: '线路', value: JSON.stringify(arr) }
      await saveRoute(tmp)
      loading.close()
      this.$message.success('保存成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.video-panel{
  background: url('../assets/video.png') no-repeat 0 0;
  width: 390px;height: 447px;
  position: absolute;left: 50%;top: 50%;
  margin: -223px 0 0 -180px;
  z-index: 9999;
  .close{
    position: absolute;right: 20px;top: 9px;
    width: 20px;height: 20px;
    cursor: pointer;
  }
  &.xfq{
    background: url('../assets/xfs.png') no-repeat 0 0;
    .close{
      right: 22px;
      top: 19px;
    }
  }
}
.abs{
  position: absolute;
  right:20px;bottom:30px;
  z-index: 99;
}
.btn-edit-line{
  position: fixed;
  bottom: 30px;
  left: 50%;
  margin-left: -40px;
  cursor: pointer;
}
.v-panel{
  position: absolute;
  right: 10px;bottom: 20px;
  width: 400px;
}
.nor-button{
  position: absolute;left: 30px;bottom: 433px;
}
.sml-map-control{
  position: absolute;left: 20px;bottom: 354px;
  width: 437px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .btn{
    background: url('../assets/btn.png') no-repeat 0 0;
    background-size: 100% 100%;
    height: 80px;width: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    span{
      font-family: 'Agency FB';
      background-image: linear-gradient(to bottom, #FFFFFF, #8FFFFF);
      -webkit-background-clip: text;
      color: transparent;
      font-size: 20px;
      white-space: nowrap;
    }
    img{
      width: 40%;
    }
  }
}
.small-map{
  position: absolute;left: 20px;bottom: 20px;
  background-color: rgba($color: #000000, $alpha: 0.3);
  border-radius: 10px;
  // 顶部内发光
  box-shadow: 0px 20px 20px inset rgba($color: #009fff, $alpha: 0.2),
    0px 0px 10px rgba($color: #4dd2ff, $alpha: 0.5);
  width: 400px;height: 300px;
  padding: 15px;
  canvas{
    // background: #0ff;
    // width: 100%;height: 100%;
  }
}
.public-body{
  position: absolute;right: 50px;top: 100px;
}
.tip-body{
  position: absolute;width: 50%;text-align: center;
  left: 40%;margin: 0 0 0 -20%;top: 100px;
  background: rgba(0, 0, 0, 0.3);color: #fff;font-size: 14px;
  padding: 10px 0;border: solid 1px #0ff;
  b{
    color: #f00;
  }
  .point{
    display: inline-block;
    padding: 3px 5px;
    margin: 0 10px;
    background: rgba(0, 0, 0, 0.3);
    border: solid 1px #fff;
    border-radius: 4px;
    cursor: pointer;
    &:hover{
      background: rgba(0, 0, 0, 0.6);
    }
    &.sel{
      background: rgb(18, 153, 231);
    }
  }
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
