
import { CameraUtilities, Time } from 'ohzi-core';

import { Vector2 } from 'three';

import { Input } from '../../../components/Input';
import { AbstractCameraState } from './AbstractCameraState';

class CommonCameraState extends AbstractCameraState
{
  constructor()
  {
    super();

    // this.vector_down_axis = new Vector3(0, -1, 0);
    // this.vector_up_axis   = new Vector3(0, 1, 0);
    // this.vector_back_axis = new Vector3(0, 0, -1);
    // this.vector_left_axis = new Vector3(-1, 0, 0);

    this.last_point = new Vector2();

    this.rotation_velocity = new Vector2();

    this.forward_dir = 0;
    this.right_dir = 0;
    this.y_dir = 0;
    this.azimuth_dir = 0;

    this.shift_key = false;
  }

  on_enter(camera_controller)
  {
  }

  on_exit(camera_controller)
  {
  }

  update(camera_controller)
  {
    this.__check_key_down();
    this.__check_key_up();

    // this.__move_camera(camera_controller);
    // this.__zoom_camera(camera_controller);
    // this.__rotate_camera(camera_controller);
  }

  __show_camera_position(camera_controller)
  {
    if (Input.left_mouse_button_released)
    {
      console.log({
        x: camera_controller.reference_position.x,
        y: camera_controller.reference_position.y,
        z: camera_controller.reference_position.z,
        orientation: camera_controller.current_orientation,
        tilt: camera_controller.current_tilt,
        azimuth: camera_controller.current_azimuth,
        zoom: camera_controller.reference_zoom,
        fov: camera_controller.camera.fov
      });
    }
  }

  __zoom_camera(camera_controller)
  {
    camera_controller.reference_zoom += Input.zoom_delta * 0.5;
  }

  __rotate_camera(camera_controller)
  {
    if (Input.left_mouse_button_down && Input.pointer_count === 1)
    {
      const delta = new Vector2(Input.NDC_delta.x * -24, Input.NDC_delta.y * -8);
      delta.multiplyScalar(Time.delta_time * 60);

      this.rotation_velocity.add(delta);
    }

    camera_controller.set_rotation_delta(this.rotation_velocity.y, this.rotation_velocity.x);
    // camera_controller.set_rotation_delta(0, 0, this.azimuth_dir);

    const blend = 1 - Math.exp(-5 * Time.delta_time);
    this.rotation_velocity.lerp(new Vector2(0, 0), blend);
  }

  __move_camera(camera_controller)
  {
    camera_controller.translate_forward(this.forward_dir);
    camera_controller.translate_right(this.right_dir);

    camera_controller.reference_position.y -= this.y_dir;

    if (Input.right_mouse_button_pressed)
    {
      this.last_point.copy(Input.NDC);
    }

    if (Input.right_mouse_button_down) // || (Input.left_mouse_button_down && this.shift_key)
    {
      const prev_point    = CameraUtilities.get_plane_intersection(camera_controller.reference_position, undefined, this.last_point).clone();
      const current_point = CameraUtilities.get_plane_intersection(camera_controller.reference_position, undefined, Input.NDC).clone();
      current_point.sub(prev_point);

      camera_controller.reference_position.x -= current_point.x;
      camera_controller.reference_position.y -= current_point.y;
      camera_controller.reference_position.z -= current_point.z;
      this.last_point.copy(Input.NDC);
    }
  }

  __check_key_down()
  {
    const speed = 0.12;

    if (Input.keyboard.is_key_down('KeyW'))
    {
      this.forward_dir = -speed;
    }
    if (Input.keyboard.is_key_down('KeyS'))
    {
      this.forward_dir = speed;
    }
    if (Input.keyboard.is_key_down('KeyA'))
    {
      this.right_dir = -speed;
    }
    if (Input.keyboard.is_key_down('KeyD'))
    {
      this.right_dir = speed;
    }
    if (Input.keyboard.is_key_down('KeyQ'))
    {
      this.azimuth_dir = speed * 4;
    }
    if (Input.keyboard.is_key_down('KeyE'))
    {
      this.azimuth_dir = -speed * 4;
    }
    if (Input.keyboard.is_key_down('KeyZ'))
    {
      this.y_dir = speed;
    }
    if (Input.keyboard.is_key_down('KeyC'))
    {
      this.y_dir = -speed;
    }
    if (Input.keyboard.is_key_down('ShiftLeft'))
    {
      this.shift_key = true;
    }
  }

  __check_key_up()
  {
    if (Input.keyboard.is_key_released('KeyW'))
    {
      this.forward_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyS'))
    {
      this.forward_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyA'))
    {
      this.right_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyD'))
    {
      this.right_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyQ'))
    {
      this.azimuth_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyE'))
    {
      this.azimuth_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyZ'))
    {
      this.y_dir = 0;
    }
    if (Input.keyboard.is_key_released('KeyC'))
    {
      this.y_dir = 0;
    }
    if (Input.keyboard.is_key_released('ShiftLeft'))
    {
      this.shift_key = false;
    }
  }
}

export { CommonCameraState };
