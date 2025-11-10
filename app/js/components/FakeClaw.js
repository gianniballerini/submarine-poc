import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import { Settings } from '../Settings';

export class FakeClaw
{
  constructor(physics_world)
  {
    this.claw = null;
    this.physics_world = physics_world;

    this.claw_1 = this.create_finger(0);
    this.claw_2 = this.create_finger(Math.PI / 2);
    this.claw_3 = this.create_finger(Math.PI);
    this.claw_4 = this.create_finger(3 * Math.PI / 2);

    this.claw = new Group();
    this.claw.add(this.claw_1.pivot);
    this.claw.add(this.claw_2.pivot);
    this.claw.add(this.claw_3.pivot);
    this.claw.add(this.claw_4.pivot);

    // Physics rigid bodies for each claw part
    this.claw_1_body = null;
    this.claw_2_body = null;
    this.claw_3_body = null;
    this.claw_4_body = null;
    this.main_claw_body = null; // Main claw body for central structure

    this.claw_1_joint = null;
    this.claw_2_joint = null;
    this.claw_3_joint = null;
    this.claw_4_joint = null;

    // Store original rotation values (closed position)
    this.claw_1_original_rotation = 0;
    this.claw_2_original_rotation = 0;
    this.claw_3_original_rotation = 0;
    this.claw_4_original_rotation = 0;

    // Target rotations for controlled movement
    this.claw_1_target_rotation = 0;
    this.claw_2_target_rotation = 0;
    this.claw_3_target_rotation = 0;
    this.claw_4_target_rotation = 0;

    // State tracking
    this.claws_open = false;
  }

  create_finger(angle)
  {
    const finger_geometry = new BoxGeometry(0.2, 1, 0.2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const pivot = new Group();

    // The cuboid (finger)
    const finger = new Mesh(finger_geometry, material);

    // Move finger so its base sits at pivot origin
    finger.position.y = 0.5;

    pivot.add(finger);

    // Position the pivot around the center of the claw
    const radius = 0.5;
    pivot.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );

    // Rotate pivot so finger faces inward
    pivot.rotation.y = angle + Math.PI / 2;

    return { pivot, finger };
  }

  init()
  {
    this.claw.position.set(0, 1, 0);
    this.claws_open = false;
  }

  init_physics()
  {
    // Create rigid bodies for each claw part with constraints

    // Create main claw body for the central structure first
  }

  create_claw_physics_body(claw_part, initial_rotation)
  {
  }

  open_claws()
  {
    this.claws_open = true;
  }

  close_claws()
  {
    this.claws_open = false;
  }

  toggle_claws()
  {
    if (this.claws_open)
    {
      this.close_claws();
    }
    else
    {
      this.open_claws();
    }
  }

  update()
  {
    this.claw_1.pivot.rotation.set(Settings.claw.finger_1_rotation.x, Settings.claw.finger_1_rotation.y, Settings.claw.finger_1_rotation.z);
    this.claw_2.pivot.rotation.set(Settings.claw.finger_2_rotation.x, Settings.claw.finger_2_rotation.y, Settings.claw.finger_2_rotation.z);
    this.claw_3.pivot.rotation.set(Settings.claw.finger_3_rotation.x, Settings.claw.finger_3_rotation.y, Settings.claw.finger_3_rotation.z);
    this.claw_4.pivot.rotation.set(Settings.claw.finger_4_rotation.x, Settings.claw.finger_4_rotation.y, Settings.claw.finger_4_rotation.z);
  }

  get_scene()
  {
    return this.claw;
  }
}
