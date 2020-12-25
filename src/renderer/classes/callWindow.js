import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import broadcastEvents from '@sdk/classes/broadcastEvents';

const OVERLAY_WINDOW_SIZES = {
  default: {
    width: 292,
    height: 124,
    maxWidth: 660,
    maxHeight: 440,
    minWidth: 1,
    minHeight: 1,
    resizable: false,
  },
  mediaSharing: {
    width: 348,
    height: 264,
    maxWidth: 660,
    maxHeight: 440,
    minWidth: 348,
    minHeight: 264,
    resizable: true,
  },
  streaming: {
    width: 348,
    height: 41, //! because renders as 42px on Windows. Whyy
  },
  streamingMax: {
    width: 348,
    height: 110,
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
    this.streamingOverlayWindow = null;
    this.lastMediaSharingMode = null;
    broadcastEvents.on('closeOverlay', () => {
      this.closeOverlay();
    });
    broadcastEvents.on('click-streaming-panel', (val) => {
      this.resizeStreamingOverlay(val ? 'streamingMax' : 'streaming');
    });
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
        margin: 50,
        aspectRatio: 1.778,
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
   * Resize overlay (and change some of its parameters)
   *
   * @param {string} type - overlay type (from OVERLAY_WINDOW_SIZES)
   * @returns {void}
   */
  resizeOverlay(type) {
    if (this.overlayWindow === null) {
      return;
    }

    const template = OVERLAY_WINDOW_SIZES[type];

    const OVERLAY_MARGIN = 50;

    this.overlayWindow.api('setResizable', true);
    this.overlayWindow.api('setMinimumSize', template.minWidth, template.minHeight);
    this.overlayWindow.api('setMaximumSize', template.maxWidth, template.maxHeight);
    this.overlayWindow.api('setResizable', template.resizable);
    this.overlayWindow.setSize(template.width, template.height, OVERLAY_MARGIN);
  }

  /**
   * Resize streaming overlay
   *
   * @param {string} type - overlay type (from OVERLAY_WINDOW_SIZES)
   * @returns {void}
   */
  resizeStreamingOverlay(type) {
    if (this.streamingOverlayWindow === null) {
      return;
    }
    const template = OVERLAY_WINDOW_SIZES[type];

    this.streamingOverlayWindow.setSize(template.width, template.height);
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
          if (this.overlayWindow && !this.streamingOverlayWindow) {
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
        if (this.overlayWindow && !this.streamingOverlayWindow) {
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

    this.hideOverlay();
    this.showStreamingOverlay();
  }

  /**
   * Hide frame window
   * @returns {void}
   */
  closeFrame() {
    if (this.frameWindow) {
      this.frameWindow.action('softClose');
      this.closeStreamingOverlay();
      this.resizeOverlay(this.lastMediaSharingMode ? 'mediaSharing' : 'default');
      this.overlayWindow.action('showInactive');
    }
  }

  /**
   * Show streaming overlay window
   * @returns {void}
   */
  showStreamingOverlay() {
    if (this.streamingOverlayWindow === null) {
      this.streamingOverlayWindow = WindowManager.create({
        route: '/call-overlay/streaming',
        template: 'overlay',
        showInactive: true,
        margin: 80,
        aspectRatio: 1.778,
        position: 'bottomLeft',
        visibleOnAllWorkspaces: true,
        window: {
          ...OVERLAY_WINDOW_SIZES['streaming'],
        },
        onClose: () => {
          this.streamingOverlayWindow = null;
        },
      });
    } else {
      this.streamingOverlayWindow.action('showInactive');
    }
  }

  /**
   * Close streaming overlay window
   * @returns {void}
   */
  closeStreamingOverlay() {
    if (this.streamingOverlayWindow) {
      this.streamingOverlayWindow.action('softClose');
    }
  }

  /**
   * Close ALL call windows
   * @returns {void}
   */
  closeAll() {
    this.manageWindow(this.frameWindow, 'softClose');
    this.manageWindow(this.gridWindow, 'close');
    this.manageWindow(this.sharingWindow, 'close');
    this.manageWindow(this.overlayWindow, 'softClose');
    this.manageWindow(this.streamingOverlayWindow, 'softClose');
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
    this.resizeOverlay(state ? 'mediaSharing' : 'default');
  }
}

export default new CallWindow();
