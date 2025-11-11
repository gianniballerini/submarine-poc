import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';
import { Settings } from '../Settings';

export class TweakPane
{
  constructor()
  {
    this.pane = new Pane({
      title: 'Camera settings',
      expanded: false
    });
    this.pane.registerPlugin(EssentialsPlugin);

    this.pane.addBinding(Settings.camera, 'fov', { min: 10, max: 120, step: 1 });

    // this.claw_folder = this.pane.addFolder({
    //   title: 'Claw settings'
    // });

    // this.claw_folder.addBinding(Settings.claw, 'finger_1_position', { label: 'Finger 1 position' });
    // this.claw_folder.addBinding(Settings.claw, 'finger_2_position', { label: 'Finger 2 position' });
    // this.claw_folder.addBinding(Settings.claw, 'finger_3_position', { label: 'Finger 3 position' });
    // this.claw_folder.addBinding(Settings.claw, 'finger_4_position', { label: 'Finger 4 position' });

    // this.claw_folder.addBinding(Settings.claw, 'finger_1_rotation', { label: 'Finger 1 rotation' });
    // this.claw_folder.addBinding(Settings.claw, 'finger_2_rotation', { label: 'Finger 2 rotation' });
    // this.claw_folder.addBinding(Settings.claw, 'finger_3_rotation', { label: 'Finger 3 rotation' });
    // this.claw_folder.addBinding(Settings.claw, 'finger_4_rotation', { label: 'Finger 4 rotation' });
  }
}
