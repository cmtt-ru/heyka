import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

const OVERLAY_WINDOW_SIZES = {
  default: {
    width: 228,
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
    this.gridWindow = null;
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
          console.log('closing: ', this.overlayWindow);
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
    if (this.overlayWindow) {
      this.overlayWindow.hide();
    }
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
    if (this.sharingWindow) {
      this.sharingWindow.hide();
    }
  }

  /**
   * Close sharing window
   * @returns {void}
   */
  closeSharing() {
    if (this.sharingWindow) {
      this.sharingWindow.close();
    }
  }

  /**
   * Show grid (main) window
   * @returns {void}
   */
  showGrid() {
    if (this.gridWindow === null) {
      this.gridWindow = WindowManager.create({
        route: '/call-window',
        position: 'center',
        template: 'call',
        alwaysOnTop: true,
        onClose: () => {
          this.gridWindow = null;
        },
      });
    } else {
      this.gridWindow.showInactive();
    }
  }

  /**
   * Hide grid (main) window
   * @returns {void}
   */
  hideGrid() {
    if (this.gridWindow) {
      this.gridWindow.hide();
    }
  }

  /**
   * Hide ALL call windows
   * @returns {void}
   */
  hideAll() {
    this.hideGrid();
    this.hideSharing();
    this.hideOverlay();
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
