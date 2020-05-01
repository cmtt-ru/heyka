import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

/**
 * Class for controlling call window
 */
class CallWindow {
  /**
   * Call window constructor
   */
  constructor() {
    this.window = null;
  }

  /**
   * Show call window
   * @returns {void}
   */
  show() {
    if (this.window === null) {
      this.window = WindowManager.create({
        route: '/call-window',
        position: 'bottomRight',
        template: 'call',
        alwaysOnTop: true,
        onClose: () => {
          this.window = null;
        },
      });
    } else {
      this.window.showInactive();
    }
  }

  /**
   * Hide call window
   * @returns {void}
   */
  hide() {
    this.window.hide();
  }
}

export default new CallWindow();
