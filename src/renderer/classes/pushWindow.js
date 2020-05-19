import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

const ONE_PUSH_SIZE = {

  width: 400,
  height: 222,
};

/**
 * Class for controlling push window
 */
class PushWindow {
  /**
   * Call window constructor
   */
  constructor() {
    this.window = null;
    this.notifications = 0;
  }

  /**
   * Show frame window
   * @param {string} displayId – display id
   * @returns {void}
   */
  show() {
    if (this.window === null) {
      this.window = WindowManager.create({
        route: '/push-window',
        position: 'topRight',
        template: 'push',
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
   * Resize push window depending on number of pushes
   * @param {number} amount number of pushes
   * @returns {void}
   */
  updateCount(amount) {
    if (amount === 0) {
      this.hide();
    } else if (this.window !== null) {
      this.show();
    } else {
      this.window.setSize(ONE_PUSH_SIZE.width, ONE_PUSH_SIZE.height * amount);
    }
  }

  /**
   * Hide push window
   * @returns {void}
   */
  hide() {
    if (this.window) {
      this.window.hide();
    }
  }
}

export default new PushWindow();