import RAPIER from '@dimforge/rapier3d-compat';
import { Time } from 'ohzi-core';
import { PointLight } from 'three';
import { Settings } from '../Settings';
import { AnimationController } from './AnimationController';
import { Input } from './Input';

class Penguin
{
  constructor(gltf, physics_world)
  {
    this.gltf = gltf;
    this.scene = gltf.scene;
    this.scene.position.set(1, 1, 0);

    this.physics_world = physics_world;

    this.move_input = { x: 0, z: 0 };
    this.speed = 4.5;
    this.acceleration = 28;
    this.collider_radius = 0.35;
    this.collider_half_height = 0.25;
    this.visual_offset_y = this.collider_half_height + this.collider_radius;

    this.__setup_physics_body();
    this.__setup_light();

    this.animation_controller = new AnimationController();
    this.animation_controller.init_gltf(this.gltf);
  }

  update()
  {
    this.__update_delta_time();
    this.__update_input();
    this.__apply_horizontal_control();
    this.__lock_vertical_axis();
    this.__sync_visuals();
    this.animation_controller.update();

    this.light.color.set(Settings.penguin.light_color);
    this.light.intensity = Settings.penguin.light_intensity;
  }

  __setup_physics_body()
  {
    if (!this.physics_world)
    {
      return;
    }

    const body_desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, this.visual_offset_y, 0)
      .setCanSleep(false)
      .setLinearDamping(0.4)
      .setAngularDamping(8);

    this.body = this.physics_world.createRigidBody(body_desc);

    const collider_desc = RAPIER.ColliderDesc.capsule(this.collider_half_height, this.collider_radius)
      .setDensity(35)
      .setFriction(8)
      .setRestitution(0.05);

    this.physics_world.createCollider(collider_desc, this.body);
  }

  __setup_light()
  {
    // Create a point light that follows the penguin
    this.light = new PointLight(Settings.penguin.light_color, Settings.penguin.light_intensity, 30);
    this.light.position.set(0, this.visual_offset_y, 0);
    this.light.castShadow = true; // Enable shadows so walls block the light

    // Configure shadow camera for point light
    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 30; // Match the light distance
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.bias = -0.0001; // Reduce shadow acne

    this.scene.add(this.light);
  }

  __update_delta_time()
  {
    this.delta_time = Math.max(Time.delta_time, 0);
  }

  __update_input()
  {
    const { x, z } = Input.is_touchscreen ? this.__handle_mobile_input() : this.__handle_keyboard_input();

    this.__apply_move_input(x, z);
  }

  __handle_keyboard_input()
  {
    let x = 0;
    let z = 0;

    if (Input.keyboard.is_key_down('KeyW'))
    {
      z -= 1;
    }
    if (Input.keyboard.is_key_down('KeyS'))
    {
      z += 1;
    }
    if (Input.keyboard.is_key_down('KeyA'))
    {
      x -= 1;
    }
    if (Input.keyboard.is_key_down('KeyD'))
    {
      x += 1;
    }

    return { x, z };
  }

  __handle_mobile_input()
  {
    let x = 0;
    let z = 0;

    if (Input.left_mouse_button_down)
    {
      const horizontal_delta = Input.last_delta.x;
      const vertical_delta = Input.last_delta.y;
      const threshold = Input.sensitivity ?? 0.05;

      if (Math.abs(horizontal_delta) > threshold)
      {
        x = Math.sign(horizontal_delta);
      }
      if (Math.abs(vertical_delta) > threshold)
      {
        z = -Math.sign(vertical_delta);
      }
    }
    else
    {
      if (Input.clicked || Input.swiped_up)
      {
        z -= 1;
      }
      if (Input.swiped_down)
      {
        z += 1;
      }
      if (Input.swiped_left)
      {
        x -= 1;
      }
      if (Input.swiped_right)
      {
        x += 1;
      }
    }

    return { x, z };
  }

  __apply_move_input(x, z)
  {
    const length = Math.hypot(x, z);

    if (length > 0)
    {
      this.move_input.x = x / length;
      this.move_input.z = z / length;
      this.desired_heading = Math.atan2(this.move_input.x, this.move_input.z);
      this.animation_controller.play_animation(this.animation_controller.animations[0]);
      return;
    }

    this.move_input.x = 0;
    this.move_input.z = 0;
    this.animation_controller.stop_animation(this.animation_controller.animations[0]);
  }

  __apply_horizontal_control()
  {
    if (!this.body)
    {
      this.__apply_fallback_translation();
      return;
    }

    const linvel = this.body.linvel();
    const target_speed = Math.hypot(this.move_input.x, this.move_input.z) > 0 ? this.speed : 0;

    const desired_vel_x = this.move_input.x * target_speed;
    const desired_vel_z = this.move_input.z * target_speed;

    const max_delta = this.acceleration * this.delta_time;
    const next_vel_x = this.__move_towards(linvel.x, desired_vel_x, max_delta);
    const next_vel_z = this.__move_towards(linvel.z, desired_vel_z, max_delta);

    this.body.setLinvel({ x: next_vel_x, y: 0, z: next_vel_z }, true);
  }

  __move_towards(current, target, max_delta)
  {
    if (current < target)
    {
      return Math.min(current + max_delta, target);
    }

    if (current > target)
    {
      return Math.max(current - max_delta, target);
    }

    return target;
  }

  __lock_vertical_axis()
  {
    if (!this.body)
    {
      this.scene.position.y = 0;
      return;
    }

    const linvel = this.body.linvel();
    const translation = this.body.translation();

    if (linvel.y !== 0)
    {
      this.body.setLinvel({ x: linvel.x, y: 0, z: linvel.z }, true);
    }

    if (translation.y !== this.visual_offset_y)
    {
      this.body.setTranslation({ x: translation.x, y: this.visual_offset_y, z: translation.z }, true);
    }
  }

  __sync_visuals()
  {
    if (this.body)
    {
      const position = this.body.translation();
      this.scene.position.set(position.x, position.y - this.visual_offset_y, position.z);

      if (Math.hypot(this.move_input.x, this.move_input.z) > 0.05)
      {
        this.scene.rotation.y = this.desired_heading ?? this.scene.rotation.y;

        // TODO: Trigger walk animation once Blender clip is ready.
      }

      return;
    }

    // Fallback when physics is not yet ready.
    this.scene.position.y = Math.max(this.scene.position.y - 0.01, 0);
  }

  __apply_fallback_translation()
  {
    const step = this.speed * this.delta_time;
    this.scene.position.x += this.move_input.x * step;
    this.scene.position.z += this.move_input.z * step;
    this.scene.position.y = Math.max(this.scene.position.y, 0);
  }
}

export { Penguin };
