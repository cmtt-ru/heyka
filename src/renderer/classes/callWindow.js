import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import broadcastEvents from '@sdk/classes/broadcastEvents';

const OVERLAY_WINDOW_SIZES = {
  default: {
    width: 292,
    height: 124,
  },
  mediaSharing: {
    width: 348,
    height: 264,
  },
  streaming: {
    width: 292,
    height: 68,
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
    this.lastMediaSharingMode = null;
    broadcastEvents.on('closeOverlay', () => {
      this.closeOverlay();
    });
  }

  /**
   * Show call overlay
   * @param {boolean} mediaSharingMode - media sharing Mode
   * @returns {void}
   */
  showOverlay(mediaSharingMode = false) {
    if (this.overlayWindow === null) {
      this.overlayWindow = WindowManager.create({
        route: '/call-overlay',
        template: 'overlay',
        showInactive: true,
        margin: 20,
        position: 'bottomRight',
        visibleOnAllWorkspaces: true,
        window: {
          ...OVERLAY_WINDOW_SIZES[mediaSharingMode ? 'mediaSharing' : 'default'],
        },
        onClose: () => {
          this.overlayWindow = null;
        },
      });
    } else {
      this.overlayWindow.action('showInactive');
    }
  }

  /**
   * Hide or close any window
   * @param {object} window - window
   * @param {('hide'|'close')} action - 'hide' or 'close'
   * @returns {void}
   */
  manageWindow(window, action) {
    if (window) {
      window.action(action);
    }
  }

  /**
   * Hide call overlay
   * @returns {void}
   */
  hideOverlay() {
    if (this.overlayWindow) {
      this.overlayWindow.action('hide');
    }
  }

  /**
   * Close call overlay
   * @returns {void}
   */
  closeOverlay() {
    if (this.overlayWindow) {
      this.overlayWindow.action('close');
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
        template: IS_DEV ? 'sharingSelectDev' : 'sharingSelect',
        position: 'center',
        onClose: () => {
          this.sharingWindow = null;
        },
      });
    } else {
      this.sharingWindow.action('showInactive');
    }
  }

  /**
   * Hide sharing window
   * @returns {void}
   */
  hideSharing() {
    if (this.sharingWindow) {
      this.sharingWindow.action('hide');
    }
  }

  /**
   * Close sharing window
   * @returns {void}
   */
  closeSharing() {
    if (this.sharingWindow) {
      this.sharingWindow.action('close');
    }
  }

  /**
   * Show grid (main) window
   * @param {number} userId - if found, open expanded view with this user
   * @returns {void}
   */
  showGrid(userId) {
    if (this.gridWindow === null) {
      let route = '/call-window';

      if (userId) {
        route = `/call-window/expanded/${userId}`;
      }

      this.gridWindow = WindowManager.create({
        route: route,
        position: 'center',
        template: 'call',
        openDevTools: true,
        preventClose: true,
        onClose: () => {
          this.gridWindow.removeAllListeners('blur');
          this.gridWindow.removeAllListeners('focus');
          this.gridWindow.removeAllListeners('hide');
          this.gridWindow = null;
          broadcastEvents.removeAllListeners('exit-fullscreen');
        },
      });

      const gridBlurTime = 200;

      this.gridTimeout = null;

      broadcastEvents.on('exit-fullscreen', () => {
        if (this.gridWindow.isFullscreen()) {
          this.gridWindow.action('fullscreen');
        }
      });

      this.gridWindow.on('blur', () => {
        broadcastEvents.dispatch('grid-expanded-blur');
        this.gridTimeout = setTimeout(() => {
          if (this.overlayWindow) {
            this.showOverlay();
          }
        }, gridBlurTime);
      });

      this.gridWindow.on('focus', () => {
        broadcastEvents.dispatch('grid-expanded-focus');
        clearTimeout(this.gridTimeout);
        this.hideOverlay();
      });

      this.gridWindow.on('hide', () => {
        clearTimeout(this.gridTimeout);
        if (this.overlayWindow) {
          this.showOverlay();
        }
      });
    } else {
      this.gridWindow.action('show');

      if (userId) {
        this.gridWindow.routerPush({
          name: 'expanded',
          params: { id: userId },
        });
      }
    }
  }

  /**
   * Hide grid (main) window
   * @returns {void}
   */
  hideGrid() {
    if (this.gridWindow) {
      this.gridWindow.action('hide');
    }
  }

  /**
   * Close grid (main) window
   * @returns {void}
   */
  closeGrid() {
    if (this.gridWindow) {
      this.gridWindow.action('close');
    }
  }

  /**
   * Show frame window
   * @param {string} displayId – display id
   * @param {number?} sourceIndex Source index
   * @returns {void}
   */
  showFrame(displayId, sourceIndex) {
    if (this.frameWindow === null) {
      this.frameWindow = WindowManager.create({
        template: 'frame',
        route: '/board-holder',
        ignoreMouseEvents: true,
        showInactive: true,
        displayId,
        sourceIndex,
        maximize: true,
        visibleOnAllWorkspaces: true,
        onClose: () => {
          this.frameWindow = null;
        },
      });
    } else {
      this.frameWindow.action('showInactive');
    }

    if (this.overlayWindow !== null) {
      const { width, height } = OVERLAY_WINDOW_SIZES['streaming'];

      this.overlayWindow.setSize(width, height);
    }
  }

  /**
   * Hide frame window
   * @returns {void}
   */
  closeFrame() {
    if (this.frameWindow) {
      this.frameWindow.action('close');

      const { width, height } = OVERLAY_WINDOW_SIZES[this.lastMediaSharingMode ? 'mediaSharing' : 'default'];

      if (this.overlayWindow !== null) {
        this.overlayWindow.setSize(width, height);
      }
    }
  }

  /**
   * Close ALL call windows
   * @returns {void}
   */
  closeAll() {
    this.manageWindow(this.frameWindow, 'close');
    this.manageWindow(this.gridWindow, 'close');
    this.manageWindow(this.sharingWindow, 'close');
    this.manageWindow(this.overlayWindow, 'close');
  }

  /**
   * Enable or disable media sharing mode
   * @param {boolean} state – enable or disable
   * @returns {void}
   */
  setMediaSharingMode(state) {
    this.lastMediaSharingMode = state;
    if (this.frameWindow) {
      return;
    }
    const { width, height } = OVERLAY_WINDOW_SIZES[state ? 'mediaSharing' : 'default'];

    if (this.overlayWindow !== null) {
      this.overlayWindow.setSize(width, height);
    }
  }
}

export default new CallWindow();
