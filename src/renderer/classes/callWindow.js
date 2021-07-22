import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import store from '@/store';
import { IS_WIN } from '@sdk/Constants';

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
    height: 42,
  },
  streamingMax: {
    width: 348,
    height: 110,
  },
};

if (IS_WIN) {
  OVERLAY_WINDOW_SIZES.streaming.height = 41; //! because renders as 42px on Windows. Whyy
}

const BLUR_TIME = 100;

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
  async manageWindow(window, action) {
    if (window) {
      return window.action(action);
    }

    return false;
  }

  /**
   * Show call overlay
   * @param {boolean} mediaSharingMode - media sharing Mode
   * @returns {void}
   */
  async showOverlay(mediaSharingMode = false) {
    if (this.streamingOverlayWindow) {
      return;
    }

    if (!store.getters['me/getSelectedChannelId']) {
      return;
    }

    if (this.overlayWindow === null) {
      this.overlayWindow = await WindowManager.create({
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
      await this.overlayWindow.action('showInactive');
    }
  }

  /**
   * Hide call overlay
   * @returns {void}
   */
  async hideOverlay() {
    if (this.overlayWindow) {
      return this.overlayWindow.action('hide');
    }

    return false;
  }

  /**
   * Close call overlay
   * @returns {void}
   */
  async closeOverlay() {
    if (this.overlayWindow) {
      return this.overlayWindow.action('softClose');
    }

    return false;
  }

  /**
   * Resize overlay (and change some of its parameters)
   *
   * @param {string} type - overlay type (from OVERLAY_WINDOW_SIZES)
   * @returns {void}
   */
  async resizeOverlay(type) {
    if (this.overlayWindow === null) {
      return;
    }

    const template = OVERLAY_WINDOW_SIZES[type];

    const OVERLAY_MARGIN = 50;

    await this.overlayWindow.api('setResizable', true);
    await this.overlayWindow.api('setMinimumSize', template.minWidth, template.minHeight);
    await this.overlayWindow.api('setMaximumSize', template.maxWidth, template.maxHeight);
    await this.overlayWindow.api('setResizable', template.resizable);
    await this.overlayWindow.setSize(template.width, template.height, OVERLAY_MARGIN);
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
  async showSharing() {
    if (this.sharingWindow === null) {
      this.sharingWindow = await WindowManager.create({
        route: '/call-sharing',
        template: IS_DEV ? 'sharingSelectDev' : 'sharingSelect',
        position: 'center',
        onClose: () => {
          this.sharingWindow = null;
        },
      });
    } else {
      await this.sharingWindow.action('showInactive');
    }
  }

  /**
   * Hide sharing window
   * @returns {void}
   */
  async hideSharing() {
    if (this.sharingWindow) {
      return this.sharingWindow.action('hide');
    }

    return false;
  }

  /**
   * Close sharing window
   * @returns {void}
   */
  async closeSharing() {
    if (this.sharingWindow) {
      return this.sharingWindow.action('close');
    }

    return false;
  }

  /**
   * Show grid (main) window
   * @param {number} userId - if found, open expanded view with this user
   * @returns {void}
   */
  async showGrid(userId) {
    console.log('WindowManager.create Grid', this.gridWindow);
    if (!this.gridWindow) {
      let route = '/call-window';

      if (userId) {
        route = `/call-window/expanded/${userId}`;
      }

      this.gridWindow = await WindowManager.create({
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
          console.log('closing Grid');
        },
      });

      this.gridTimeout = null;

      broadcastEvents.on('exit-fullscreen', async () => {
        const isFullscreen = await this.gridWindow.isFullscreen();

        if (isFullscreen) {
          await this.gridWindow.action('fullscreen');
        }
      });

      this.gridWindow.on('blur', () => {
        broadcastEvents.dispatch('grid-expanded-blur');
        this.gridTimeout = setTimeout(() => {
          if (this.streamingOverlayWindow) {
            this.streamingOverlayWindow.action('showInactive');
          // uncomment next if need to show mini-overlay with blurred, but visible grid window
          } else if (this.overlayWindow) {
            this.showOverlay();
          }
        }, BLUR_TIME);
      });

      this.gridWindow.on('focus', () => {
        clearTimeout(this.gridTimeout);
        if (this.streamingOverlayWindow) {
          this.streamingOverlayWindow.action('hide');
        } else {
          this.hideOverlay();
        }
        broadcastEvents.dispatch('grid-expanded-focus');
      });

      this.gridWindow.on('hide', () => {
        clearTimeout(this.gridTimeout);
        setTimeout(() => {
          if (this.streamingOverlayWindow) {
            this.streamingOverlayWindow.action('showInactive');
          } else if (this.overlayWindow) {
            this.showOverlay();
          }
          broadcastEvents.dispatch('grid-hide');
        }, BLUR_TIME);
      });
    } else {
      await this.gridWindow.action('show');

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
  async hideGrid() {
    if (this.gridWindow) {
      return this.gridWindow.action('hide');
    }

    return false;
  }

  /**
   * Close grid (main) window
   * @returns {void}
   */
  async closeGrid() {
    if (this.gridWindow) {
      return this.gridWindow.action('close');
    }

    return false;
  }

  /**
   * Show frame window
   * @param {string} displayId – display id
   * @param {number?} sourceIndex Source index
   * @returns {void}
   */
  async showFrame(displayId, sourceIndex) {
    if (this.frameWindow === null) {
      this.frameWindow = await WindowManager.create({
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

      broadcastEvents.on('frame-window-resized', () => {
        this.frameWindow.action('maximize');
      });
    } else {
      await this.frameWindow.action('showInactive');
    }

    setTimeout(async () => {
      await this.closeOverlay();
      await this.showStreamingOverlay();
      await this.closeGrid();
    }, BLUR_TIME);
  }

  /**
   * Show frame window console
   * @returns {void}
   */
  async showFrameConsole() {
    if (this.frameWindow !== null) {
      return this.frameWindow.action('console');
    }

    return false;
  }

  /**
   * Hide frame window
   * @returns {void}
   */
  async closeFrame() {
    if (this.frameWindow) {
      broadcastEvents.removeAllListeners('frame-window-resized');
      await this.frameWindow.action('softClose');
      await this.closeStreamingOverlay();
    }
  }

  /**
   * Show streaming overlay window
   * @returns {void}
   */
  async showStreamingOverlay() {
    if (this.streamingOverlayWindow === null) {
      this.streamingOverlayWindow = await WindowManager.create({
        route: '/call-overlay/streaming',
        template: 'sharingOverlay',
        showInactive: true,
        margin: 80,
        position: 'bottomLeft',
        visibleOnAllWorkspaces: true,
        window: {
          ...OVERLAY_WINDOW_SIZES['streamingMax'],
        },
        onClose: async () => {
          this.streamingOverlayWindow = null;
          await this.resizeOverlay(this.lastMediaSharingMode ? 'mediaSharing' : 'default');
          await this.showOverlay();
        },
      });
    } else {
      await this.streamingOverlayWindow.action('showInactive');
    }
  }

  /**
   * Close streaming overlay window
   * @returns {void}
   */
  async closeStreamingOverlay() {
    if (this.streamingOverlayWindow) {
      return this.streamingOverlayWindow.action('softClose');
    }

    return false;
  }

  /**
   * Close ALL call windows
   * @returns {void}
   */
  async closeAll() {
    await this.manageWindow(this.frameWindow, 'softClose');
    await this.manageWindow(this.gridWindow, 'softClose');
    await this.manageWindow(this.sharingWindow, 'softClose');
    await this.manageWindow(this.overlayWindow, 'softClose');
    await this.manageWindow(this.streamingOverlayWindow, 'softClose');
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
