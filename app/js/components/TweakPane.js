import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';
import { Settings } from '../Settings';

export class TweakPane
{
  constructor()
  {
    const pane = new Pane({
      title: 'Camera settings',
      expanded: false
    });
    pane.registerPlugin(EssentialsPlugin);

    pane.addBinding(Settings.camera, 'fov', { min: 10, max: 120, step: 1 });
    // pane.addBinding(Settings.waves, 'amplitude', { min: 0, max: 5, step: 0.01 });

    // pane.addBinding(Settings.waves, 'thickness', {
    //   min: 0,
    //   max: 4,

    //   step: 0.01
    // });

    // pane.addBinding(Settings.waves, 'gradient_point_0', {
    //   x: { step: 0.01, min: -0.5, max: 1.5 },
    //   y: { step: 0.01, min: -0.5, max: 1.5, inverted: true },
    //   picker: 'inline',
    //   expanded: true
    // });

    // pane.addBinding(Settings.waves, 'gradient_point_1', {
    //   x: { step: 0.01, min: -0.5, max: 1.5 },
    //   y: { step: 0.01, min: -0.5, max: 1.5, inverted: true },
    //   picker: 'inline',
    //   expanded: true
    // });

    if (!Settings.debug_mode)
    {
      // document.querySelector('.lil-gui.autoPlace').style.display = 'none';
    }
  }
}
