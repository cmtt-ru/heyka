import { ipcMain, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import Positioner from './Positioner';
import templates from './templates.json';
import { v4 as uuidV4 } from 'uuid';

// const isMac = process.platform === 'darwin';
// const isLinux = process.platform === 'linux';
// const isWin = !isMac && !isLinux;

const DEFAULT_WINDOW_OPTIONS = {
  width: 780,
  height: 560,
  x: 0,
  y: 0,
  // backgroundColor: '#000000', //! need to set same color as main bg color of theme
  frame: false,
  movable: true,
  fullscreenable: false,
  resizable: true,
  transparent: false,
  alwaysOnTop: false,
  show: false,
  skipTaskBar: true,
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false,
  },
};

/**
 * A class that handles all windows
 */
class WindowManager {
  /**
   * Inits windowmanager class, assigns mainwindow
   * @param {object} mainWindow mainWindow instance
   * @returns {void}
   */
  constructor() {
    this.windows = [];

    ipcMain.on('window-manager-create', (event, options) => {
      const windowId = this.createWindow(options);

      event.returnValue = {
        id: windowId,
      };
    });

    ipcMain.on('window-manager-close', (event, options) => {
      // console.log('window-manager-close', options);
      this.closeWindow(options.id);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-hide', (event, options) => {
      // console.log('window-manager-hide', options);
      this.hideWindow(options.id);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-show', (event, options) => {
      // console.log('window-manager-show', options);
      this.showWindow(options.id);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-show-inactive', (event, options) => {
      this.showInactiveWindow(options.id);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-focus', (event, options) => {
      this.focusWindow(options.id);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-blur', (event, options) => {
      this.blurWindow(options.id);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-move-me', (event, options) => {
      // console.log('window-manager-show', options);
      const { x, y } = screen.getCursorScreenPoint();
      const newX = x - options.mouseX;
      const newY = y - options.mouseY;
      const browserWindow = event.sender.getOwnerBrowserWindow();

      browserWindow.setPosition(newX, newY);
    });

    ipcMain.on('main-window-unload', () => {
      Object.keys(this.windows).forEach(windowId => {
        try {
          this.windows[windowId].close();
        } catch (e) {
        }
        this.windows[windowId] = null;
        delete this.windows[windowId];
      });
    });
  }

  /**
   * Get BrowserWindow instance by ID
   * @param {string} windowId window ID
   * @returns {object} BrowserWindow instance
   */
  getWindow(windowId) {
    return this.windows[windowId];
  }

  /**
   * Create secondary Window
   * @param {object} options mainWindow instance
   * @returns {string} ID of created window
   */
  createWindow(options) {
    if (options.template && templates[options.template]) {
      options.window = { ...templates[options.template] };
    }
    const newWindow = new BrowserWindow(Object.assign({}, DEFAULT_WINDOW_OPTIONS, options.window || {}));

    const windowId = uuidV4();

    this.windows[windowId] = newWindow;

    let devUrl = process.env.WEBPACK_DEV_SERVER_URL + '#' + options.route;
    let prodUrl = 'heyka://./index.html/#' + options.route;

    if (options.url) {
      devUrl = process.env.WEBPACK_DEV_SERVER_URL + options.url + '#' + options.route;
      prodUrl = 'heyka://./' + options.url + '#' + options.route;
    }

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      newWindow.loadURL(devUrl);
      // if (!process.env.IS_TEST) {
      //   newWindow.webContents.openDevTools();
      // }
    } else {
      createProtocol('heyka');
      newWindow.loadURL(prodUrl);
    }

    newWindow.once('close', e => {
      ipcMain.emit(`window-close-${windowId}`);
    });

    newWindow.on('ready-to-show', (event) => {
      // newWindow.setAlwaysOnTop(true, 'floating', 3);
      const position = getWindowPosition(newWindow, options.position);

      newWindow.setPosition(position.x, position.y);
      newWindow.show();
    });

    return windowId;
  }

  /**
   * Set window position
   * @param {object} wnd window instance
   * @param {string} pos position of window
   * @returns {string} ID of created window
   */
  setPosition(wnd, pos = 'center') {
    const position = getWindowPosition(wnd, pos);

    wnd.setPosition(position.x, position.y);
  }

  /**
   * Destroy window
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  closeWindow(windowId) {
    if (this.windows[windowId]) {
      try {
        this.windows[windowId].close();
      } catch (e) {
        console.error('window already closed');
      }

      this.windows[windowId] = null;
      delete this.windows[windowId];
    }
  }

  /**
   * Hide window
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  hideWindow(windowId) {
    if (this.windows[windowId]) {
      this.windows[windowId].hide();
    }
  }

  /**
   * Show window
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  showWindow(windowId) {
    if (this.windows[windowId]) {
      this.windows[windowId].show();
    }
  }

  /**
   * Show window inactive
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  showInactiveWindow(windowId) {
    if (this.windows[windowId]) {
      this.windows[windowId].showInactive();
    }
  }

  /**
   * Focus window
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  focusWindow(windowId) {
    if (this.windows[windowId]) {
      this.windows[windowId].focus();
    }
  }

  /**
   * Blur window
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  blurWindow(windowId) {
    if (this.windows[windowId]) {
      this.windows[windowId].blur();
    }
  }
}

export default new WindowManager();

/**
 * Adjust window position in regard to tray
 * @param {object} wnd window instance
 * @param {string} pos window position
 * @param {boolean} trayAdjust if position is near tray
 * @returns {object} adjusted window coordinates
 */
function getWindowPosition(wnd, pos = 'center') {
  const testMargin = 20;
  const positioner = new Positioner(wnd, testMargin);

  return positioner.calculate(pos);
}
