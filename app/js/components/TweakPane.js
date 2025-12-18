import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';
import { Settings } from '../Settings';

export class TweakPane
{
  constructor()
  {
    this.pane = new Pane({
      title: 'Settings',
      expanded: false
    });
    this.pane.registerPlugin(EssentialsPlugin);

    // this.pane.addBinding(Settings.camera, 'fov', { min: 10, max: 120, step: 1 });

    this.floor_folder = this.pane.addFolder({
      title: 'Floor'
    });

    this.floor_folder.addBinding(Settings.floor, 'gridSize', { label: 'Grid size' });

    this.light_folder = this.pane.addFolder({
      title: 'World Light'
    });
    this.light_folder.addBinding(Settings.light, 'color', { label: 'Light color' });
    this.light_folder.addBinding(Settings.light, 'intensity', { label: 'Light intensity' });
    this.light_folder.addBinding(Settings.ambient_light, 'color', { label: 'Ambient light color' });
    this.light_folder.addBinding(Settings.ambient_light, 'intensity', { label: 'Ambient light intensity' });

    this.penguin_folder = this.pane.addFolder({
      title: 'Penguin'
    });
    this.penguin_folder.addBinding(Settings.penguin, 'light_color', { label: 'Penguin color' });
    this.penguin_folder.addBinding(Settings.penguin, 'light_intensity', { label: 'Penguin intensity' });
  }
}
