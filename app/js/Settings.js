class Settings
{
  constructor()
  {
    this.debug_mode = false;
    this.dpr = 1;

    this.camera = {
      fov: 60
    };

    this.claw = {
      finger_1_position: { x: 0.8, y: 0, z: 0 },
      finger_2_position: { x: -0.8, y: 0, z: 0 },
      finger_3_position: { x: 0.56, y: -0.56, z: 0 },
      finger_4_position: { x: -0.56, y: -0.56, z: 0 },
      finger_1_rotation: { x: 0, y: 0, z: 0 },
      finger_2_rotation: { x: 0, y: 0, z: 0 },
      finger_3_rotation: { x: 0, y: 0, z: 0 },
      finger_4_rotation: { x: 0, y: 0, z: 0 }
    };
  }
}

const settings = new Settings();
export { settings as Settings };
