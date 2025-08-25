import RAPIER from '@dimforge/rapier3d-compat';
import { SceneManager } from 'ohzi-core';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { HomeScene } from '../../scenes/HomeScene';

class HomeSceneController
{
  constructor()
  {
    this.setup_world();
  }

  start()
  {
    this.scene = new HomeScene();
  }

  before_enter()
  {
    this.scene.setup_camera();

    SceneManager.current = this.scene;
  }

  on_enter()
  {
    // Create cube
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    this.cube = cube;
    this.scene.add(cube);

    // Create floor geometry
    const floorGeometry = new BoxGeometry(20.0, 0.2, 20.0);
    const floorMaterial = new MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.8 });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.1, 0);
    this.floor = floor;
    this.scene.add(floor);
  }

  before_exit()
  {
  }

  on_exit()
  {
  }

  update()
  {
    this.scene.update();
    this.world.step();
    const position = this.rigidBody.translation();
    const rotation = this.rigidBody.rotation();

    this.cube.position.set(position.x, position.y, position.z);
    this.cube.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  update_enter_transition(global_view_data, transition_progress, action_sequencer)
  {
    this.scene.update();
  }

  update_exit_transition(global_view_data, transition_progress, action_sequencer)
  {
  }

  setup_world()
  {
    this.gravity = { x: 0, y: -9.81, z: 0 };
    this.world = new RAPIER.World(this.gravity);

    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.1, 0.0);

    this.groundBody = this.world.createRigidBody(groundBodyDesc);

    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
    this.world.createCollider(groundColliderDesc, this.groundBody);

    // Create a dynamic rigid-body.
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 10.0, 0.0);
    rigidBodyDesc.setRotation({ w: 1.0, x: 0.2, y: 0.4, z: 0.0 });

    this.rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Create a cuboid collider attached to the dynamic rigidBody.
    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    this.collider = this.world.createCollider(colliderDesc, this.rigidBody);
  }
}

export { HomeSceneController };
