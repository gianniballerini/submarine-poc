class Settings
{
  constructor()
  {
    this.debug_mode = false;
    this.dpr = 1;

    this.camera = {
      fov: 60
    };

    this.floor = {
      gridSize: 14,
      cubeSize: 10.0,
      cubeHeight: 0.2,
      wallHeight: 2.0,
      wallThickness: 0.2
    };

    this.light = {
      color: '#ffffff',
      intensity: 0
    };

    this.ambient_light = {
      color: '#ffffff',
      intensity: 0.01
    };

    this.penguin = {
      light_color: '#ffffff',
      light_intensity: 5.0,
      visual_offset_y: 0.25
    };
  }
}

const settings = new Settings();
export { settings as Settings };
