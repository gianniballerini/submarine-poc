import RAPIER from '@dimforge/rapier3d-compat';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';

class Section
{
  constructor(config = {})
  {
    this.gridX = config.gridX || 0;
    this.gridZ = config.gridZ || 0;
    this.worldX = config.worldX || 0;
    this.worldZ = config.worldZ || 0;
    this.cubeSize = config.cubeSize || 10.0;
    this.cubeHeight = config.cubeHeight || 0.2;
    this.wallHeight = config.wallHeight || 2.0;
    this.wallThickness = config.wallThickness || 0.2;
    this.color = config.color || 0x808080;
    this.physicsWorld = config.physicsWorld || null;

    // Door configuration: object with 'north', 'south', 'east', 'west' boolean properties
    this.doors = config.doors || {
      north: false,
      south: false,
      east: false,
      west: false
    };

    this.doorWidth = config.doorWidth || 3.0; // Width of the door opening

    this.group = new Group();
    this.__create_section();
  }

  __create_section()
  {
    // Create floor tile
    const cubeGeometry = new BoxGeometry(this.cubeSize, this.cubeHeight, this.cubeSize);
    const cubeMaterial = new MeshStandardMaterial({ color: this.color });
    const cube = new Mesh(cubeGeometry, cubeMaterial);
    cube.receiveShadow = true;

    // Position the floor cube relative to the group
    cube.position.set(0, -this.cubeHeight / 2, 0);
    this.group.add(cube);

    // Create walls
    this.__create_walls(cubeMaterial);

    // Add physics colliders for walls
    if (this.physicsWorld)
    {
      this.__create_physics_colliders();
    }

    // Position the entire section group
    this.group.position.set(this.worldX, 0, this.worldZ);
  }

  __create_walls(material)
  {
    // North wall (positive Z)
    if (!this.doors.north)
    {
      this.__create_full_wall('north', material);
    }
    else
    {
      this.__create_wall_with_door('north', material);
    }

    // South wall (negative Z)
    if (!this.doors.south)
    {
      this.__create_full_wall('south', material);
    }
    else
    {
      this.__create_wall_with_door('south', material);
    }

    // East wall (positive X)
    if (!this.doors.east)
    {
      this.__create_full_wall('east', material);
    }
    else
    {
      this.__create_wall_with_door('east', material);
    }

    // West wall (negative X)
    if (!this.doors.west)
    {
      this.__create_full_wall('west', material);
    }
    else
    {
      this.__create_wall_with_door('west', material);
    }
  }

  __create_full_wall(direction, material)
  {
    let geometry = null;
    let position = null;

    switch (direction)
    {
    case 'north':
      geometry = new BoxGeometry(this.cubeSize, this.wallHeight, this.wallThickness);
      position = { x: 0, y: this.wallHeight / 2, z: this.cubeSize / 2 };
      break;
    case 'south':
      geometry = new BoxGeometry(this.cubeSize, this.wallHeight, this.wallThickness);
      position = { x: 0, y: this.wallHeight / 2, z: -this.cubeSize / 2 };
      break;
    case 'east':
      geometry = new BoxGeometry(this.wallThickness, this.wallHeight, this.cubeSize);
      position = { x: this.cubeSize / 2, y: this.wallHeight / 2, z: 0 };
      break;
    case 'west':
      geometry = new BoxGeometry(this.wallThickness, this.wallHeight, this.cubeSize);
      position = { x: -this.cubeSize / 2, y: this.wallHeight / 2, z: 0 };
      break;
    }

    const wall = new Mesh(geometry, material);
    wall.position.set(position.x, position.y, position.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.group.add(wall);
  }

  __create_wall_with_door(direction, material)
  {
    const wallSegmentSize = (this.cubeSize - this.doorWidth) / 2;

    switch (direction)
    {
    case 'north':
    case 'south':
    {
      // Create two wall segments with a gap in the middle
      // Left segment
      const leftSegmentGeometry = new BoxGeometry(wallSegmentSize, this.wallHeight, this.wallThickness);
      const leftSegment = new Mesh(leftSegmentGeometry, material);
      leftSegment.position.set(-this.cubeSize / 2 + wallSegmentSize / 2, this.wallHeight / 2, direction === 'north' ? this.cubeSize / 2 : -this.cubeSize / 2);
      leftSegment.castShadow = true;
      leftSegment.receiveShadow = true;
      this.group.add(leftSegment);

      // Right segment
      const rightSegmentGeometry = new BoxGeometry(wallSegmentSize, this.wallHeight, this.wallThickness);
      const rightSegment = new Mesh(rightSegmentGeometry, material);
      rightSegment.position.set(this.cubeSize / 2 - wallSegmentSize / 2, this.wallHeight / 2, direction === 'north' ? this.cubeSize / 2 : -this.cubeSize / 2);
      rightSegment.castShadow = true;
      rightSegment.receiveShadow = true;
      this.group.add(rightSegment);

      // Door frame (top)
      const topFrameGeometry = new BoxGeometry(this.doorWidth, this.wallThickness, this.wallThickness);
      const topFrame = new Mesh(topFrameGeometry, material);
      topFrame.position.set(0, this.wallHeight - this.wallThickness / 2, direction === 'north' ? this.cubeSize / 2 : -this.cubeSize / 2);
      topFrame.castShadow = true;
      topFrame.receiveShadow = true;
      this.group.add(topFrame);
      break;
    }

    case 'east':
    case 'west':
    {
      // Create two wall segments with a gap in the middle
      // Top segment
      const topSegmentGeometry = new BoxGeometry(this.wallThickness, this.wallHeight, wallSegmentSize);
      const topSegment = new Mesh(topSegmentGeometry, material);
      topSegment.position.set(direction === 'east' ? this.cubeSize / 2 : -this.cubeSize / 2, this.wallHeight / 2, this.cubeSize / 2 - wallSegmentSize / 2);
      topSegment.castShadow = true;
      topSegment.receiveShadow = true;
      this.group.add(topSegment);

      // Bottom segment
      const bottomSegmentGeometry = new BoxGeometry(this.wallThickness, this.wallHeight, wallSegmentSize);
      const bottomSegment = new Mesh(bottomSegmentGeometry, material);
      bottomSegment.position.set(direction === 'east' ? this.cubeSize / 2 : -this.cubeSize / 2, this.wallHeight / 2, -this.cubeSize / 2 + wallSegmentSize / 2);
      bottomSegment.castShadow = true;
      bottomSegment.receiveShadow = true;
      this.group.add(bottomSegment);

      // Door frame (top)
      const sideTopFrameGeometry = new BoxGeometry(this.wallThickness, this.wallThickness, this.doorWidth);
      const sideTopFrame = new Mesh(sideTopFrameGeometry, material);
      sideTopFrame.position.set(direction === 'east' ? this.cubeSize / 2 : -this.cubeSize / 2, this.wallHeight - this.wallThickness / 2, 0);
      sideTopFrame.castShadow = true;
      sideTopFrame.receiveShadow = true;
      this.group.add(sideTopFrame);
      break;
    }
    }
  }

  __create_physics_colliders()
  {
    // Create a fixed rigid body for this section's walls at the section center
    const wallBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(this.worldX, 0, this.worldZ);
    const wallBody = this.physicsWorld.createRigidBody(wallBodyDesc);

    const wallSegmentSize = (this.cubeSize - this.doorWidth) / 2;

    // North wall collider (skip if door exists)
    if (!this.doors.north)
    {
      const northColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.cubeSize / 2,
        this.wallHeight / 2,
        this.wallThickness / 2
      ).setTranslation(0, this.wallHeight / 2, this.cubeSize / 2);
      this.physicsWorld.createCollider(northColliderDesc, wallBody);
    }
    else
    {
      // Create colliders for the two wall segments
      const leftColliderDesc = RAPIER.ColliderDesc.cuboid(
        wallSegmentSize / 2,
        this.wallHeight / 2,
        this.wallThickness / 2
      ).setTranslation(-this.cubeSize / 2 + wallSegmentSize / 2, this.wallHeight / 2, this.cubeSize / 2);
      this.physicsWorld.createCollider(leftColliderDesc, wallBody);

      const rightColliderDesc = RAPIER.ColliderDesc.cuboid(
        wallSegmentSize / 2,
        this.wallHeight / 2,
        this.wallThickness / 2
      ).setTranslation(this.cubeSize / 2 - wallSegmentSize / 2, this.wallHeight / 2, this.cubeSize / 2);
      this.physicsWorld.createCollider(rightColliderDesc, wallBody);
    }

    // South wall collider (skip if door exists)
    if (!this.doors.south)
    {
      const southColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.cubeSize / 2,
        this.wallHeight / 2,
        this.wallThickness / 2
      ).setTranslation(0, this.wallHeight / 2, -this.cubeSize / 2);
      this.physicsWorld.createCollider(southColliderDesc, wallBody);
    }
    else
    {
      // Create colliders for the two wall segments
      const leftColliderDesc = RAPIER.ColliderDesc.cuboid(
        wallSegmentSize / 2,
        this.wallHeight / 2,
        this.wallThickness / 2
      ).setTranslation(-this.cubeSize / 2 + wallSegmentSize / 2, this.wallHeight / 2, -this.cubeSize / 2);
      this.physicsWorld.createCollider(leftColliderDesc, wallBody);

      const rightColliderDesc = RAPIER.ColliderDesc.cuboid(
        wallSegmentSize / 2,
        this.wallHeight / 2,
        this.wallThickness / 2
      ).setTranslation(this.cubeSize / 2 - wallSegmentSize / 2, this.wallHeight / 2, -this.cubeSize / 2);
      this.physicsWorld.createCollider(rightColliderDesc, wallBody);
    }

    // East wall collider (skip if door exists)
    if (!this.doors.east)
    {
      const eastColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.wallThickness / 2,
        this.wallHeight / 2,
        this.cubeSize / 2
      ).setTranslation(this.cubeSize / 2, this.wallHeight / 2, 0);
      this.physicsWorld.createCollider(eastColliderDesc, wallBody);
    }
    else
    {
      // Create colliders for the two wall segments
      const topColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.wallThickness / 2,
        this.wallHeight / 2,
        wallSegmentSize / 2
      ).setTranslation(this.cubeSize / 2, this.wallHeight / 2, this.cubeSize / 2 - wallSegmentSize / 2);
      this.physicsWorld.createCollider(topColliderDesc, wallBody);

      const bottomColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.wallThickness / 2,
        this.wallHeight / 2,
        wallSegmentSize / 2
      ).setTranslation(this.cubeSize / 2, this.wallHeight / 2, -this.cubeSize / 2 + wallSegmentSize / 2);
      this.physicsWorld.createCollider(bottomColliderDesc, wallBody);
    }

    // West wall collider (skip if door exists)
    if (!this.doors.west)
    {
      const westColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.wallThickness / 2,
        this.wallHeight / 2,
        this.cubeSize / 2
      ).setTranslation(-this.cubeSize / 2, this.wallHeight / 2, 0);
      this.physicsWorld.createCollider(westColliderDesc, wallBody);
    }
    else
    {
      // Create colliders for the two wall segments
      const topColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.wallThickness / 2,
        this.wallHeight / 2,
        wallSegmentSize / 2
      ).setTranslation(-this.cubeSize / 2, this.wallHeight / 2, this.cubeSize / 2 - wallSegmentSize / 2);
      this.physicsWorld.createCollider(topColliderDesc, wallBody);

      const bottomColliderDesc = RAPIER.ColliderDesc.cuboid(
        this.wallThickness / 2,
        this.wallHeight / 2,
        wallSegmentSize / 2
      ).setTranslation(-this.cubeSize / 2, this.wallHeight / 2, -this.cubeSize / 2 + wallSegmentSize / 2);
      this.physicsWorld.createCollider(bottomColliderDesc, wallBody);
    }
  }

  get_center_position()
  {
    return {
      x: this.worldX,
      z: this.worldZ
    };
  }
}

export { Section };
