
import { Sections } from '../views/Sections';

import { home_high_objects } from '../../data/assets/home/high/home_high_objects';
import { home_high_sounds } from '../../data/assets/home/high/home_high_sounds';
import { home_high_textures } from '../../data/assets/home/high/home_high_textures';
import { home_objects } from '../../data/assets/home/home_objects';
import { home_textures } from '../../data/assets/home/home_textures';

import RAPIER from '@dimforge/rapier3d-compat';
import { CameraManager, Debug, Graphics, Grid, OScreen, PerspectiveCamera, ResourceContainer } from 'ohzi-core';
import { Color, PCFSoftShadowMap } from 'three';
import { CameraController } from '../camera_controller/CameraController';
import { Floor } from '../components/Floor';
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
    // Enable shadows on the renderer (for potential penguin light shadows)
    Graphics._renderer.shadowMap.enabled = true;
    Graphics._renderer.shadowMap.type = PCFSoftShadowMap;

    // Penguin is the only light source - no ambient or directional lights
  }

  update()
  {
    super.update();

    this.camera.fov = Settings.camera.fov;

    this.penguin.update();

    // Update camera to follow penguin
    if (this.penguin && this.penguin.body)
    {
      const penguinPosition = this.penguin.body.translation();
      this.camera_controller.reference_position.set(penguinPosition.x, penguinPosition.y, penguinPosition.z);
    }
    else if (this.penguin && this.penguin.scene)
    {
      // Fallback: use visual position if physics body isn't available
      const penguinPos = this.penguin.scene.position;
      this.camera_controller.reference_position.set(penguinPos.x, penguinPos.y + this.penguin.visual_offset_y, penguinPos.z);
    }

    this.camera_controller.update();

    if (this.world)
    {
      this.world.step();
    }
  }

  on_assets_ready()
  {
    this.set_high_assets(home_high_objects, home_high_textures, home_high_sounds);

    super.on_assets_ready();

    this.floor = new Floor({
      gridSize: Settings.floor.gridSize,
      cubeSize: Settings.floor.cubeSize,
      cubeHeight: Settings.floor.cubeHeight,
      wallHeight: Settings.floor.wallHeight,
      wallThickness: Settings.floor.wallThickness,
      physicsWorld: this.world
    });

    this.add(this.floor.group);

    // Position penguin at the center of the grid (always valid regardless of grid size)
    const centerSquare = this.floor.get_center_square();
    const centerPosition = this.floor.get_center_position(centerSquare.x, centerSquare.z);
    const penguinStartX = centerPosition.x;
    const penguinStartZ = centerPosition.z;

    this.penguin = new Penguin(ResourceContainer.get('penguin'), this.world);

    // Update penguin physics body position to center of square
    if (this.penguin.body)
    {
      const physicsY = this.penguin.visual_offset_y;
      this.penguin.body.setTranslation({ x: penguinStartX, y: physicsY, z: penguinStartZ }, true);
      // Set visual position immediately (it will sync in update loop, but set it here too)
      this.penguin.scene.position.set(penguinStartX, physicsY - this.penguin.visual_offset_y, penguinStartZ);
    }
    else
    {
      // Fallback: set visual position if physics body isn't ready yet
      this.penguin.scene.position.set(penguinStartX, 0, penguinStartZ);
    }

    this.add(this.penguin.scene);

    this.add_lights();
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

  dispose()
  {
    // Clean up physics world before disposing Three.js resources
    if (this.world)
    {
      // Free all rigid bodies and colliders
      // Note: RAPIER automatically cleans up bodies and colliders when world is freed
      try
      {
        this.world.free();
      }
      catch (error)
      {
        console.warn('Error freeing RAPIER world:', error);
      }
      this.world = null;
      this.groundBody = null;
    }

    // Clean up penguin if it exists
    if (this.penguin)
    {
      // Stop animations
      if (this.penguin.animation_controller && this.penguin.animation_controller.mixer)
      {
        this.penguin.animation_controller.stop_animations();
        // Clear mixer reference (Three.js will handle cleanup)
        this.penguin.animation_controller.mixer = null;
      }
      // Body is already freed when world is freed, but clear reference
      this.penguin.body = null;
      this.penguin = null;
    }

    // Clean up floor if it exists
    if (this.floor)
    {
      this.floor = null;
    }

    // Clean up camera controller
    if (this.camera_controller)
    {
      this.camera_controller = null;
    }

    // Call parent dispose to clean up Three.js resources
    super.dispose();
  }
}
