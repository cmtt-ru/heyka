import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

const OVERLAY_WINDOW_SIZES = {
  default: {
    width: 184,
    height: 96,
  },
  mediaSharing: {
    width: 340,
    height: 222,
  },
};

/**
 * Class for controlling call windows
 */
class CallWindow {
  /**
   * Call window constructor
   */
  constructor() {
    this.overlayWindow = null;
    this.sharingWindow = null;
  }

  /**
   * Show call overlay
   * @returns {void}
   */
  showOverlay() {
    if (this.overlayWindow === null) {
      this.overlayWindow = WindowManager.create({
        route: '/call-overlay',
        position: 'bottomRight',
        window: {
          ...OVERLAY_WINDOW_SIZES['default'],
          alwaysOnTop: true,
          backgroundColor: '#000',
        },
        onClose: () => {
          this.overlayWindow = null;
        },
      });
    } else {
      this.overlayWindow.showInactive();
    }
  }

  /**
   * Hide call overlay
   * @returns {void}
   */
  hideOverlay() {
    this.overlayWindow.hide();
  }

  /**
   * Show sharing window
   * @returns {void}
   */
  showSharing() {
    if (this.sharingWindow === null) {
      this.sharingWindow = WindowManager.create({
        route: '/call-sharing',
        position: 'center',
        window: {
          width: 500,
          height: 500,
          // alwaysOnTop: true,
          backgroundColor: '#000',
        },
        onClose: () => {
          this.sharingWindow = null;
        },
      });
    } else {
      this.sharingWindow.showInactive();
    }
  }

  /**
   * Hide sharing window
   * @returns {void}
   */
  hideSharing() {
    this.sharingWindow.hide();
  }

  /**
   * Enable or disable media sharing mode
   * @param {boolean} state – enable or disable
   * @returns {void}
   */
  setMediaSharingMode(state) {
    const { width, height } = OVERLAY_WINDOW_SIZES[state ? 'mediaSharing' : 'default'];

    if (this.overlayWindow !== null) {
      this.overlayWindow.setSize(width, height);
    }
  }
}

export default new CallWindow();
