import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

const WINDOW_SIZES = {
  default: {
    width: 184,
    height: 96,
  },
  screenSharing: {
    width: 340,
    height: 265,
  },
};

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
        window: {
          ...WINDOW_SIZES['default'],
          alwaysOnTop: true,
          backgroundColor: '#000',
        },
        onClose: () => {
          this.window = null;
        },
      });
    } else {
      this.window.showInactive();
    }
  }

  /**
   * Enable or disable screen sharing mode
   * @param {boolean} state – enable or disable
   * @returns {void}
   */
  setScreenSharingMode(state) {
    const { width, height } = WINDOW_SIZES[state ? 'screenSharing' : 'default'];

    if (this.window !== null) {
      this.window.setSize(width, height);
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
