import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import { ipcRenderer } from 'electron';

const OVERLAY_WINDOW_SIZES = {
  default: {
    width: 228,
    height: 96,
    skipTaskbar: true,
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
    this.frameWindow = null;
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

    this.showFrame();
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
      this.hideFrame();
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

      const gridBlurTime = 200;
      let gridTimeout = null;

      ipcRenderer.on(`window-blur-${this.gridWindow.windowId}`, () => {
        gridTimeout = setTimeout(() => {
          this.showOverlay();
        }, gridBlurTime);
      });
      ipcRenderer.on(`window-focus-${this.gridWindow.windowId}`, () => {
        clearTimeout(gridTimeout);
        this.hideOverlay();
      });
    } else {
      this.gridWindow.show();
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
   * Show frame window
   * @returns {void}
   */
  showFrame() {
    if (this.frameWindow === null) {
      this.frameWindow = WindowManager.create({
        route: '/call-frame',
        // ignoreMouseEvents: true,
        window: {
          position: 'topLeft',
          width: 500,
          height: 500,
          alwaysOnTop: true,
          frame: false,
          resizable: false,
          movable: false,
          transparent: true,
          skipTaskbar: true,
          enableLargerThanScreen: true,
          background: 'transparent',
        },
        onClose: () => {
          this.frameWindow = null;
        },
      });
    } else {
      this.frameWindow.showInactive();
    }
  }

  /**
   * Hide frame window
   * @returns {void}
   */
  hideFrame() {
    if (this.frameWindow) {
      this.frameWindow.hide();
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
   * Close ALL call windows
   * @returns {void}
   */
  closeAll() {
    if (this.gridWindow) {
      this.gridWindow.close();
    }
    if (this.sharingWindow) {
      this.sharingWindow.close();
    }
    if (this.overlayWindow) {
      this.overlayWindow.close();
    }
    if (this.frameWindow) {
      this.frameWindow.close();
    }
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
