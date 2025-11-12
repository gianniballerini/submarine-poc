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
      gridSize: 10,
      cubeSize: 10.0,
      cubeHeight: 0.2,
      wallHeight: 2.0,
      wallThickness: 0.2
    };
  }
}

const settings = new Settings();
export { settings as Settings };
