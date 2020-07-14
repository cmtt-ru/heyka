import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

/**
 * Class for controlling push window
 */
class BoardHolderWindow {
  /**
   * Call window constructor
   */
  constructor() {
    this.window = null;
  }

  /**
   * Show board holder window
   * @param {string} displayId – display id
   * @returns {void}
   */
  show(displayId) {
    if (this.window === null) {
      this.window = WindowManager.create({
        template: 'frame',
        route: '/board-holder',
        ignoreMouseEvents: true,
        showInactive: true,
        displayId,
        maximize: true,
        visibleOnAllWorkspaces: true,
        alwaysOnTop: true,
        onClose: () => {
          this.window = null;
        },

      });
    }
  }

  /**
   * Hide board holder window
   * @returns {void}
   */
  hide() {
    if (this.window) {
      this.window.action('hide');
    }
  }

  /**
   * Close board holder window
   * @returns {void}
   */
  close() {
    if (this.window) {
      this.window.action('close');
    }
  }
}

export default new BoardHolderWindow();
