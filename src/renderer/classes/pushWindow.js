import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

const ONE_PUSH_SIZE = {

  width: 368,
  height: 76,
};
const TOP_MARGIN = 12;
const PUSH_MOVEOUT_TIMER = 500;

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
        margin: 0,
        template: 'push',
        visibleOnAllWorkspaces: true,
        window: ONE_PUSH_SIZE,
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
      setTimeout(() => {
        this.window.close();
      }, PUSH_MOVEOUT_TIMER);
    } else if (this.window === null) {
      this.show();
    } else {
      if (this.notifications < amount) {
        this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * amount);
      } else {
        setTimeout(() => {
          this.window.setSize(ONE_PUSH_SIZE.width, TOP_MARGIN + ONE_PUSH_SIZE.height * amount);
        }, PUSH_MOVEOUT_TIMER);
      }
    }
    this.notifications = amount;
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