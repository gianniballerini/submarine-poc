import { CommonView } from '../common/CommonView';
import { Sections, SectionsURLs } from '../Sections';

import { WipSceneController } from './WipSceneController';
import { WipTransitionController } from './WipTransitionController';

import wip_data from '../../../data/transitions/wip.json';

class WipView extends CommonView
{
  constructor()
  {
    super({
      name: Sections.WIP,
      url: SectionsURLs.WIP,
      container: document.querySelector('.wip'),
      transition_data: wip_data
    });

    this.scene_controller = new WipSceneController();
    this.transition_controller = new WipTransitionController();
  }

  get scene()
  {
    return this.scene_controller.scene;
  }

  start()
  {
    this.scene_controller.start();
    this.transition_controller.start();
  }

  before_enter()
  {
    super.before_enter();

    this.scene_controller.before_enter();
    this.transition_controller.before_enter();
  }

  on_enter()
  {
    super.on_enter();

    this.scene_controller.on_enter();
    this.transition_controller.on_enter();
  }

  before_exit()
  {
    super.before_exit();

    this.scene_controller.before_exit();
    this.transition_controller.before_exit();
  }

  on_exit()
  {
    super.on_exit();

    this.scene_controller.on_exit();
    this.transition_controller.on_exit();
  }

  update()
  {
    this.scene_controller.update();
    this.transition_controller.update();
  }

  update_enter_transition(global_view_data, transition_progress, action_sequencer)
  {
    this.scene_controller.update_enter_transition(global_view_data, transition_progress, action_sequencer);
    this.transition_controller.update_enter_transition(global_view_data, transition_progress, action_sequencer);
  }

  update_exit_transition(global_view_data, transition_progress, action_sequencer)
  {
    this.scene_controller.update_exit_transition(global_view_data, transition_progress, action_sequencer);
    this.transition_controller.update_exit_transition(global_view_data, transition_progress, action_sequencer);
  }
}

export { WipView };
