import { ipcRenderer } from 'electron';
import { EventEmitter } from 'events';

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
  create(options) {
    const windowData = ipcRenderer.sendSync('window-manager-create', options);

    return new Window(windowData.id, options.onClose);
  }

  getCurrentWindowId() {
    const substr = process.argv.find(argv => argv.indexOf('--window-id') === 0);

    return substr.split('=')[1];
  }

  getCurrentWindow() {
    return new Window(this.getCurrentWindowId());
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
  }

  /**
   * Destroy window - send signal to main process
   * @returns {void}
   */
  close() {
    ipcRenderer.sendSync('window-manager-close', {
      id: this.windowId,
    });
  }

  /**
   * Hide window - send signal to main process
   * @returns {void}
   */
  hide() {
    ipcRenderer.sendSync('window-manager-hide', {
      id: this.windowId,
    });
  }

  /**
   * Show window - send signal to main process
   * @returns {void}
   */
  show() {
    ipcRenderer.sendSync('window-manager-show', {
      id: this.windowId,
    });
  }

  /**
   * Show window - send signal to main process
   * @returns {void}
   */
  showInactive() {
    ipcRenderer.sendSync('window-manager-show-inactive', {
      id: this.windowId,
    });
  }

  /**
   * Focus window - send signal to main process
   * @returns {void}
   */
  focus() {
    ipcRenderer.sendSync('window-manager-focus', {
      id: this.windowId,
    });
  }

  /**
   * Blur window - send signal to main process
   * @returns {void}
   */
  blur() {
    ipcRenderer.sendSync('window-manager-blur', {
      id: this.windowId,
    });
  }

  /**
   * Toggle fullscreen mode - send signal to main process
   * @returns {void}
   */
  toggleFullscreen() {
    ipcRenderer.sendSync('window-manager-fullscreen', {
      id: this.windowId,
    });
  }

  /**
   * Open url in window - send signal to main process
   * @param {string} route route to move to
   * @param {string} url url to move to (if not index.html)
   * @returns {void}
   */
  openUrl(route, url) {
    ipcRenderer.sendSync('window-manager-openurl', {
      id: this.windowId,
      url,
      route,
    });
  }

  /**
   * Set window size
   * @param {number} width - window width
   * @param {number} height - window height
   * @returns {void}
   */
  setSize(width, height) {
    ipcRenderer.sendSync('window-manager-size', {
      id: this.windowId,
      width,
      height,
    });
  }
}

export default new WindowManager();
