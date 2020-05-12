import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import store from '@/store';

const stateStore = new Store({
  name: 'state',
});

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
    /** Save actual state to store */
    stateStore.set('state', store.state);

    const windowData = ipcRenderer.sendSync('window-manager-create', options);

    return new Window(windowData.id, options.onClose);
  }
}

/**
 * A class that handles created window instance
 */
class Window {
  /**
   * Inits window
   * @param {string} windowId window ID
   * @param {function} onClose function to trigger upon window closing
   * @returns {void}
   */
  constructor(windowId, onClose) {
    this.windowId = windowId;
    this.onClose = onClose;

    ipcRenderer.on(`window-close-${windowId}`, () => {
      this.onClose();
    });
    // ipcRenderer.on(`window-blur-${windowId}`, () => {
    // });
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
