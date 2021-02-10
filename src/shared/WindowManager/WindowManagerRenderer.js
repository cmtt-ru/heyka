import { ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
import broadcastEvents from '@sdk/classes/broadcastEvents';

/**
 * A class that tells info to main window manager upon window creation
 */
class WindowManager {
  /** @namespace WindowManagerRenderer */
  /**
   * Create new window by passing window to main process's window manager
   * @param {object} options window options
   * @returns {Window}
   */
  async create(options) {
    const onClose = options.onClose;

    delete options.onClose;
    const windowData = await ipcRenderer.invoke('window-manager-create', options);

    return new Window(windowData.id, onClose);
  }

  /**
   * Get ID of window which invoked this method
   * @returns {void}
   */
  getCurrentWindowId() {
    const substr = process.argv.find(argv => argv.indexOf('--window-id') === 0);

    return substr.split('=')[1];
  }

  /**
   * Get Window instance of window which invoked this method
   * @returns {Window}
   */
  getCurrentWindow() {
    return new Window(this.getCurrentWindowId());
  }

  /**
   * Set will quit flag
   * @returns {Promise}
   */
  async willQuit() {
    return ipcRenderer.invoke('window-manager-event', {
      event: 'willQuit',
    });
  }
}

/**
 * A class that handles created window instance
 */
class Window extends EventEmitter {
  /**
   * Inits window
   * @param {string} windowId window ID
   * @param {function} onClose function to trigger upon window closing
   * @returns {void}
   */
  constructor(windowId, onClose) {
    super();
    this.windowId = windowId;
    this.onClose = onClose;

    ipcRenderer.on(`window-close-${windowId}`, () => {
      this.onClose();
      this.emit('close');
    });

    ipcRenderer.on(`window-blur-${windowId}`, () => {
      this.emit('blur');
    });
    ipcRenderer.on(`window-focus-${windowId}`, () => {
      this.emit('focus');
    });
    ipcRenderer.on(`window-hide-${windowId}`, () => {
      this.emit('hide');
    });
  }

  /**
   * All signals sent to main process
   * @param {string} event - event name
   * @param {object} data – event data
   * @returns {Promise}
   */
  async action(event, data) {
    return ipcRenderer.invoke('window-manager-event', {
      event,
      id: this.windowId,
      data,
    });
  }

  /**
   * Browserwindow's api sent to main process
   * @param {string} method - method name
   * @param {object} params - params
   * @returns {void}
   */
  async api(method, ...params) {
    return ipcRenderer.invoke('window-manager-api',
      method,
      this.windowId,
      ...params
    );
  }

  /**
   * Open url in window - send signal to main process
   * @param {string} route route to move to
   * @param {string} url url to move to (if not index.html)
   * @returns {Promise}
   */
  async openUrl(route, url) {
    return ipcRenderer.invoke('window-manager-event', {
      event: 'openurl',
      id: this.windowId,
      url,
      route,
    });
  }

  /**
   * Navigate with window's router
   * @param {object} routerParams – router params, like, `url`, or `name`
   * @returns {void}
   */
  routerPush(routerParams) {
    broadcastEvents.dispatch(`window-router-push-${this.windowId}`, routerParams);
  }

  /**
   * Set window size
   * @param {number} width - window width
   * @param {number} height - window height
   * @param {number} margin - window margin to screen bounds
   * @returns {Promise}
   */
  async setSize(width, height, margin) {
    return ipcRenderer.invoke('window-manager-event', {
      event: 'size',
      id: this.windowId,
      width,
      height,
      margin,
    });
  }

  /**
   * Set window position
   *
   * @param {string} position - window position (eg. 'center', 'bottomRight')
   * @param {number} margin - window pos margin
   * @returns {Promise}
   */
  async setPosition(position, margin) {
    return ipcRenderer.invoke('window-manager-event', {
      event: 'position',
      id: this.windowId,
      position,
      margin,
    });
  }

  /**
   * Whether window is in fullscreen mode
   * @returns {boolean}
   */
  async isFullscreen() {
    return ipcRenderer.invoke('window-manager-is-fullscreen', {
      id: this.windowId,
    });
  }
}

export default new WindowManager();
