import { Settings } from '../Settings';

export class Claw
{
  constructor(claw_model, physics_world)
  {
    this.claw = claw_model;
    this.physics_world = physics_world;

    // Get claw parts
    this.claw_1 = this.claw.getObjectByName('claw_0');
    this.claw_2 = this.claw.getObjectByName('claw_1');
    this.claw_3 = this.claw.getObjectByName('claw_2');
    this.claw_4 = this.claw.getObjectByName('claw_3');

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

  init()
  {
    this.claw.scale.set(0.5, 0.5, 0.5);
    this.claw.position.set(0, 1, 0);

    // Store original rotation values (closed position)
    this.claw_1_original_rotation = this.claw_1.rotation.z;
    this.claw_2_original_rotation = this.claw_2.rotation.z;
    this.claw_3_original_rotation = this.claw_3.rotation.z;
    this.claw_4_original_rotation = this.claw_4.rotation.z;

    // Initialize target rotations
    this.claw_1_target_rotation = this.claw_1_original_rotation + Settings.claw.rotation_angle;
    this.claw_2_target_rotation = this.claw_2_original_rotation + Settings.claw.rotation_angle;
    this.claw_3_target_rotation = this.claw_3_original_rotation + Settings.claw.rotation_angle;
    this.claw_4_target_rotation = this.claw_4_original_rotation + Settings.claw.rotation_angle;

    this.claws_open = false;

    this.init_physics();
  }

  init_physics()
  {
    // Create rigid bodies for each claw part with constraints
    this.claw_1_body = this.create_claw_physics_body(this.claw_1, this.claw_1_original_rotation);
    this.claw_2_body = this.create_claw_physics_body(this.claw_2, this.claw_2_original_rotation);
    this.claw_3_body = this.create_claw_physics_body(this.claw_3, this.claw_3_original_rotation);
    this.claw_4_body = this.create_claw_physics_body(this.claw_4, this.claw_4_original_rotation);

    this.claw_1_joint = this.physics_world.world.createJoint(this.physics_world.RAPIER.RevoluteJointDesc.new(this.claw_1_body, this.claw_2_body, {
      anchor: { x: 0, y: 0, z: 0 },
      axis: { x: 0, y: 0, z: 1 }
    }));

    this.claw_2_joint = this.physics_world.world.createJoint(this.physics_world.RAPIER.RevoluteJointDesc.new(this.claw_2_body, this.claw_3_body, {
      anchor: { x: 0, y: 0, z: 0 },
      axis: { x: 0, y: 0, z: 1 }
    }));

    this.claw_3_joint = this.physics_world.world.createJoint(this.physics_world.RAPIER.RevoluteJointDesc.new(this.claw_3_body, this.claw_4_body, {
      anchor: { x: 0, y: 0, z: 0 },
      axis: { x: 0, y: 0, z: 1 }
    }));

    this.claw_4_joint = this.physics_world.world.createJoint(this.physics_world.RAPIER.RevoluteJointDesc.new(this.claw_4_body, this.claw_1_body, {
      anchor: { x: 0, y: 0, z: 0 },
      axis: { x: 0, y: 0, z: 1 }
    }));

    // Create main claw body for the central structure
    this.create_main_claw_body();
  }

  create_claw_physics_body(claw_part, initial_rotation)
  {
    // Create a dynamic rigid body for the claw part
    const bodyDesc = this.physics_world.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(claw_part.position.x, claw_part.position.y, claw_part.position.z)
      .setAngularDamping(Settings.claw.rotation_damping)
      .setLinearDamping(0.99); // Very high linear damping to keep it in place

    const body = this.physics_world.world.createRigidBody(bodyDesc);

    // Create multiple colliders for the entire claw part to create a cage effect
    this.create_claw_colliders(claw_part, body);

    // Link the physics body to the visual object
    claw_part.userData.physicsBody = body;
    claw_part.userData.initialRotation = initial_rotation;

    return body;
  }

  create_claw_colliders(claw_part, body)
  {
    // Main claw body collider (capsule shape for the arm)
    const mainColliderDesc = this.physics_world.RAPIER.ColliderDesc.capsule(0.1, 0.3)
      .setTranslation(0, 0, 0)
      .setFriction(0.8)
      .setRestitution(0.2)
      .setCollisionGroups(0x0001) // Claw collision group
      .setCollisionGroups(0x0002); // Can collide with objects

    this.physics_world.world.createCollider(mainColliderDesc, body);

    // Claw tip collider (sphere for better object interaction)
    const tipColliderDesc = this.physics_world.RAPIER.ColliderDesc.ball(0.08)
      .setTranslation(0, 0.3, 0) // Position at the tip
      .setFriction(0.9)
      .setRestitution(0.1)
      .setCollisionGroups(0x0001)
      .setCollisionGroups(0x0002);

    this.physics_world.world.createCollider(tipColliderDesc, body);

    // Side claw colliders (small spheres for the claw fingers)
    const sideColliderDesc1 = this.physics_world.RAPIER.ColliderDesc.ball(0.05)
      .setTranslation(0.15, 0.2, 0) // Right side
      .setFriction(0.7)
      .setRestitution(0.1)
      .setCollisionGroups(0x0001)
      .setCollisionGroups(0x0002);

    const sideColliderDesc2 = this.physics_world.RAPIER.ColliderDesc.ball(0.05)
      .setTranslation(-0.15, 0.2, 0) // Left side
      .setFriction(0.7)
      .setRestitution(0.1)
      .setCollisionGroups(0x0001)
      .setCollisionGroups(0x0002);

    this.physics_world.world.createCollider(sideColliderDesc1, body);
    this.physics_world.world.createCollider(sideColliderDesc2, body);
  }

  create_main_claw_body()
  {
    // Create a main rigid body for the central claw structure
    const mainBodyDesc = this.physics_world.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(this.claw.position.x, this.claw.position.y, this.claw.position.z)
      .setAngularDamping(0.99)
      .setLinearDamping(0.99);

    this.main_claw_body = this.physics_world.world.createRigidBody(mainBodyDesc);

    // Create a large collider for the main claw body that can push objects
    const mainColliderDesc = this.physics_world.RAPIER.ColliderDesc.cylinder(0.2, 0.8)
      .setTranslation(0, 0, 0)
      .setFriction(0.6)
      .setRestitution(0.3)
      .setCollisionGroups(0x0001) // Claw collision group
      .setCollisionGroups(0x0002); // Can collide with objects

    this.physics_world.world.createCollider(mainColliderDesc, this.main_claw_body);

    // Link the main body to the claw
    this.claw.userData.mainPhysicsBody = this.main_claw_body;
  }

  open_claws()
  {
    // TODO: Implement
  }

  close_claws()
  {
    // TODO: Implement
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
    // TODO: Implement
  }

  get_scene()
  {
    return this.claw;
  }
}
