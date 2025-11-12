import { Color, Group } from 'three';
import { Section } from './Section';

class Floor
{
  constructor(config = {})
  {
    this.gridSize = config.gridSize || 10;
    this.cubeSize = config.cubeSize || 10.0;
    this.cubeHeight = config.cubeHeight || 0.2;
    this.wallHeight = config.wallHeight || 2.0;
    this.wallThickness = config.wallThickness || 0.2;
    this.physicsWorld = config.physicsWorld || null;

    // Calculate offset to center the grid
    this.gridOffset = -(this.gridSize * this.cubeSize) / 2 + this.cubeSize / 2;

    this.group = new Group();
    this.sections = [];
    this.__create_floor();
  }

  __create_floor()
  {
    // Function to generate a unique color for each section based on its position
    const getSectionColor = (x, z) =>
    {
      // Use a hash-like function to generate distinct colors
      const seed = x * this.gridSize + z;
      const hue = (seed * 137.508) % 360; // Golden angle approximation for good distribution
      const saturation = 50 + (seed % 30); // Vary saturation between 50-80%
      const lightness = 40 + (seed % 20); // Vary lightness between 40-60%

      // Use Three.js Color class for HSL conversion
      const color = new Color();
      color.setHSL(hue / 360, saturation / 100, lightness / 100);
      return color.getHex();
    };

    // First pass: create all sections
    for (let x = 0; x < this.gridSize; x++)
    {
      for (let z = 0; z < this.gridSize; z++)
      {
        // Calculate world position for this section
        const worldX = this.gridOffset + x * this.cubeSize;
        const worldZ = this.gridOffset + z * this.cubeSize;

        // Determine which sides should have doors (connect to adjacent sections)
        const doors = {
          north: z < this.gridSize - 1, // Connect to section above
          south: z > 0, // Connect to section below
          east: x < this.gridSize - 1, // Connect to section to the right
          west: x > 0 // Connect to section to the left
        };

        // Create a section
        const section = new Section({
          gridX: x,
          gridZ: z,
          worldX: worldX,
          worldZ: worldZ,
          cubeSize: this.cubeSize,
          cubeHeight: this.cubeHeight,
          wallHeight: this.wallHeight,
          wallThickness: this.wallThickness,
          color: getSectionColor(x, z),
          doors: doors,
          physicsWorld: this.physicsWorld
        });

        this.sections.push(section);
        this.group.add(section.group);
      }
    }
  }

  get_section(gridX, gridZ)
  {
    return this.sections.find(section => section.gridX === gridX && section.gridZ === gridZ);
  }

  get_center_position(squareX, squareZ)
  {
    return {
      x: this.gridOffset + squareX * this.cubeSize,
      z: this.gridOffset + squareZ * this.cubeSize
    };
  }

  get_center_square()
  {
    return {
      x: Math.floor(this.gridSize / 2),
      z: Math.floor(this.gridSize / 2)
    };
  }
}

export { Floor };
