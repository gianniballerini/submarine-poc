import { SceneManager } from 'ohzi-core';
import { HomeScene } from '../../scenes/HomeScene';

class HomeSceneController
{
  constructor()
  {
    this.scene = null;
  }

  start()
  {
    // Dispose previous scene if it exists (in case start() is called multiple times)
    if (this.scene && typeof this.scene.dispose === 'function')
    {
      this.scene.dispose();
    }
    this.scene = new HomeScene();
  }

  before_enter()
  {
    this.scene.setup_camera();

    SceneManager.current = this.scene;
  }

  on_enter()
  {
  }

  before_exit()
  {
  }

  on_exit()
  {
    // Note: We don't dispose the scene here because it might be reused
    // (e.g., WipSceneController reuses HomeScene). The scene will be disposed
    // when start() is called again or when the application shuts down.
    // If you need to dispose on exit, uncomment the following:
    // if (this.scene && typeof this.scene.dispose === 'function')
    // {
    //   this.scene.dispose();
    //   this.scene = null;
    // }
  }

  update()
  {
    this.scene.update();
  }

  update_enter_transition(global_view_data, transition_progress, action_sequencer)
  {
    this.scene.update();
  }

  update_exit_transition(global_view_data, transition_progress, action_sequencer)
  {
  }
}

export { HomeSceneController };
