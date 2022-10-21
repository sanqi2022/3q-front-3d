import * as THREE from 'three';
import Component from '../common/Component'
import { Ammo, createConvexHullShape } from '../common/AmmoLib'

export default class GroundMesh extends Component {
  constructor(world, scene) {
    super();
    this.scene = scene;
    this.name = "GroundMesh";
    this.physicsWorld = world
  }

  initMesh() {
    // const texture = new THREE.TextureLoader().load('/texture/BL.jpg')
    // texture.wrapS = THREE.RepeatWrapping
    // texture.wrapT = THREE.RepeatWrapping

    const geometry = new THREE.BoxGeometry(1000, 10, 1000);
    const material = new THREE.MeshBasicMaterial({ color: 0x232324, side: THREE.DoubleSide })
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true
    this.mesh.position.set(0, -5, 0)
    this.mesh.visible = false
    this.scene.add(this.mesh)
    this.SetStaticCollider(this.mesh)
    //test
    // const geometry2 = new THREE.BoxGeometry(20, 20, 20);
    // const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    // let mesh = new THREE.Mesh(geometry2, material2);
    // mesh.position.set(-78.0433090237442, 5, 27.290382196394482)
    // this.scene.add(mesh)
    // this.SetStaticCollider(mesh)
    // AddObject(mesh)

    // //test light
    // const geometry3 = new THREE.BoxGeometry(10, 10, 10);
    // const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    // const plane3 = new THREE.Mesh(geometry3, material3);
    // plane3.position.set(0, 10, 0);
    // plane3.layers.enable(1)
    // this.scene.add(plane3);
  }

  SetStaticCollider(mesh) {
    const shape = createConvexHullShape(mesh);
    const mass = 0;
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const object = new Ammo.btRigidBody(rbInfo);
    object.parentEntity = this.parent;
    object.mesh = mesh;

    this.physicsWorld.addRigidBody(object);
  }

  Initialize() {
    this.initMesh()
  }
}
