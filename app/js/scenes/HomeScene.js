
import { Sections } from '../views/Sections';

import { home_high_objects } from '../../data/assets/home/high/home_high_objects';
import { home_high_sounds } from '../../data/assets/home/high/home_high_sounds';
import { home_high_textures } from '../../data/assets/home/high/home_high_textures';
import { home_objects } from '../../data/assets/home/home_objects';
import { home_textures } from '../../data/assets/home/home_textures';

import RAPIER from '@dimforge/rapier3d-compat';
import { CameraManager, Debug, Grid, OScreen, PerspectiveCamera, ResourceContainer } from 'ohzi-core';
import { AmbientLight, BoxGeometry, Color, DirectionalLight, Mesh, MeshBasicMaterial } from 'three';
import { CameraController } from '../camera_controller/CameraController';
import { Penguin } from '../components/Penguin';
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

    this.camera.fov = Settings.camera.fov;

    this.penguin.update();

    if (this.world)
    {
      this.world.step();
    }
  }

  on_assets_ready()
  {
    this.set_high_assets(home_high_objects, home_high_textures, home_high_sounds);

    super.on_assets_ready();

    // Create floor geometry
    const floorGeometry = new BoxGeometry(100.0, 0.2, 100.0);
    const floorMaterial = new MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.8 });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.1, 0);
    this.floor = floor;
    this.add(floor);

    this.penguin = new Penguin(ResourceContainer.get('penguin'), this.world);

    this.add(this.penguin.scene);

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
    this.camera_controller.set_idle();
    // this.camera_controller.set_simple_mode();

    this.camera_controller.min_zoom = 1;
    this.camera_controller.max_zoom = 40;

    this.camera_controller.reference_position.set(0, 0, 0);
    this.camera_controller.set_rotation(0, 0);
  }

  setup_world()
  {
    this.gravity = { x: 0, y: -16, z: 0 };
    this.world = new RAPIER.World(this.gravity);

    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.1, 0.0);

    this.groundBody = this.world.createRigidBody(groundBodyDesc);

    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
    this.world.createCollider(groundColliderDesc, this.groundBody);
  }
}
