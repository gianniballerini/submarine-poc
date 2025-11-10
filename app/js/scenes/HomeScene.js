
import { Sections } from '../views/Sections';

import { home_high_objects } from '../../data/assets/home/high/home_high_objects';
import { home_high_sounds } from '../../data/assets/home/high/home_high_sounds';
import { home_high_textures } from '../../data/assets/home/high/home_high_textures';
import { home_objects } from '../../data/assets/home/home_objects';
import { home_textures } from '../../data/assets/home/home_textures';

import RAPIER from '@dimforge/rapier3d-compat';
import { CameraManager, Debug, Grid, OScreen, PerspectiveCamera, ResourceContainer } from 'ohzi-core';
import { AmbientLight, BoxGeometry, Color, DirectionalLight, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import { CameraController } from '../camera_controller/CameraController';
import { Settings } from '../Settings';
import { CommonScene } from './common/CommonScene';

// import { AmbientLight, DirectionalLight } from 'three';
export class HomeScene extends CommonScene
{
  constructor()
  {
    super({
      name: Sections.HOME
    });
  }

  init()
  {
    super.init();

    this.camera_controller = new CameraController();

    this.init_camera();

    this.set_assets(home_objects, home_textures, []);

    // AudioManager.setup_sounds_names(home_high_sounds);

    if (Settings.debug_mode)
    {
      this.add(Debug.draw_axis());
      this.add(new Grid());
    }

    this.setup_world();
  }

  add_lights()
  {
    const light = new AmbientLight('#FFFFFF', 0.9);
    this.add(light);

    const directional_light = new DirectionalLight('#FFFFFF', 0.5);
    directional_light.position.set(0, 10, 20);
    this.add(directional_light);
  }

  update()
  {
    super.update();

    this.camera_controller.update();

    // this.camera.fov = Settings.camera.fov;

    if (this.world)
    {
      this.world.step();

      // const position = this.rigidBody.translation();
      // const rotation = this.rigidBody.rotation();

      // this.cube.position.set(position.x, position.y, position.z);
      // this.cube.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    // Update claw component
    // this.claw_component.update();

    // Sync interactive spheres with physics
    if (this.interactive_spheres)
    {
      this.interactive_spheres.forEach(sphere =>
      {
        if (sphere.userData.physicsBody)
        {
          const position = sphere.userData.physicsBody.translation();
          const rotation = sphere.userData.physicsBody.rotation();
          sphere.position.set(position.x, position.y, position.z);
          sphere.rotation.set(rotation.x, rotation.y, rotation.z);
        }
      });
    }
  }

  on_assets_ready()
  {
    this.set_high_assets(home_high_objects, home_high_textures, home_high_sounds);

    super.on_assets_ready();

    // Create floor geometry
    const floorGeometry = new BoxGeometry(20.0, 0.2, 20.0);
    const floorMaterial = new MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.8 });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.1, 0);
    this.floor = floor;
    this.add(floor);

    // Initialize claw component
    // const claw_model = ResourceContainer.get('the_claw').scene;
    // this.claw_component = new Claw(claw_model, { world: this.world, RAPIER: RAPIER });
    // this.claw_component.init();
    // this.add(this.claw_component.get_scene());

    // this.claw_component = new FakeClaw(this.world);
    // this.claw_component.init();
    // this.add(this.claw_component.get_scene());

    this.penguin = ResourceContainer.get('penguin').scene;
    this.penguin.position.set(0, 0, 0);
    this.add(this.penguin);

    this.add_lights();
  }

  toggle_claws()
  {
    this.claw_component.toggle_claws();
  }

  on_high_quality_assets_ready()
  {
    super.on_high_quality_assets_ready();
  }

  init_camera()
  {
    this.camera = new PerspectiveCamera(60, OScreen.aspect_ratio, 0.1, 200);
    this.camera.updateProjectionMatrix();
    // this.camera.position.z = 10;

    this.camera.clear_color.copy(new Color('#181818'));
    this.camera.clear_alpha = 1;
  }

  setup_camera()
  {
    CameraManager.current = this.camera;

    this.camera_controller.set_camera(this.camera);
    // this.camera_controller.set_idle();
    this.camera_controller.set_simple_mode();

    this.camera_controller.min_zoom = 1;
    this.camera_controller.max_zoom = 40;

    this.camera_controller.reference_position.set(0, 0, 0);
    this.camera_controller.set_rotation(0, 0);
  }

  setup_world()
  {
    this.gravity = { x: 0, y: -9.81, z: 0 };
    this.world = new RAPIER.World(this.gravity);

    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.1, 0.0);

    this.groundBody = this.world.createRigidBody(groundBodyDesc);

    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
    this.world.createCollider(groundColliderDesc, this.groundBody);

    // // Create a dynamic rigid-body.
    // const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 10.0, 0.0);
    // rigidBodyDesc.setRotation({ w: 1.0, x: 0.2, y: 0.4, z: 0.0 });

    // this.rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // // Create a cuboid collider attached to the dynamic rigidBody.
    // const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    // this.collider = this.world.createCollider(colliderDesc, this.rigidBody);

    // Add some interactive spheres for the claw to interact with
    // this.create_interactive_spheres();
  }

  create_interactive_spheres()
  {
    // Create several spheres that the claw can interact with
    const spherePositions = [
      { x: 0, y: 2, z: 0 },
      { x: -2, y: 2, z: 0 },
      { x: 0, y: 2, z: 2 },
      { x: 0, y: 2, z: -2 }
    ];

    this.interactive_spheres = [];

    spherePositions.forEach((pos, index) =>
    {
      // Create physics body
      const sphereBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(pos.x, pos.y, pos.z)
        .setAngularDamping(0.8)
        .setLinearDamping(0.3);

      const sphereBody = this.world.createRigidBody(sphereBodyDesc);

      // Create sphere collider
      const sphereColliderDesc = RAPIER.ColliderDesc.ball(0.3)
        .setFriction(0.7)
        .setRestitution(0.6);

      this.world.createCollider(sphereColliderDesc, sphereBody);

      // Create visual representation
      const geometry = new SphereGeometry(0.3, 16, 16);
      const material = new MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new Mesh(geometry, material);
      sphere.position.set(pos.x, pos.y, pos.z);
      sphere.userData.physicsBody = sphereBody;
      this.add(sphere);
      this.interactive_spheres.push(sphere);
    });
  }
}
