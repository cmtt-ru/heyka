import { ipcMain, BrowserWindow, screen } from 'electron';
import Positioner from './Positioner';
import adjustBounds from '@/main/libs/adjustWindowBounds';
import templates from './templates.json';
import { v4 as uuidV4 } from 'uuid';
import cloneDeep from 'clone-deep';

// const isMac = process.platform === 'darwin';
// const isLinux = process.platform === 'linux';
// const isWin = !isMac && !isLinux;

const DEFAULT_WINDOW_OPTIONS = Object.freeze({
  width: 780,
  height: 560,
  x: 0,
  y: 0,
  // backgroundColor: '#000000', //! need to set same color as main bg color of theme
  frame: false,
  fullscreenable: false,
  show: false,
  skipTaskBar: true,
  webPreferences: Object.freeze({
    nodeIntegration: true,
    webSecurity: true,
  }),
});

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

    ipcMain.on('window-manager-size', (event, options) => {
      this.sizeWindow(options);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-fullscreen', (event, options) => {
      this.toggleFullscreenWindow(options.id);
      event.returnValue = true;
    });
    ipcMain.on('window-manager-openurl', (event, options) => {
      this.openUrl(options.id, options.route);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-is-main-window', (event, options) => {
      event.returnValue = this.mainWindowId === options.id;
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
    const windowId = uuidV4();

    if (options.template && templates[options.template]) {
      options.window = Object.assign(cloneDeep(templates[options.template]), cloneDeep(options.window));
    }

    const windowOptions = Object.assign(cloneDeep(DEFAULT_WINDOW_OPTIONS), cloneDeep(options.window));

    windowOptions.webPreferences.additionalArguments = [ '--window-id=' + windowId ];

    const newWindow = new BrowserWindow(windowOptions);

    if (process.env.NODE_ENV === 'production') {
      newWindow.removeMenu();
    }
    this.windows[windowId] = newWindow;

    if (options.ignoreMouseEvents) {
      newWindow.setIgnoreMouseEvents(true);
    }

    this.openUrl(windowId, options.route, options.url);

    newWindow.once('close', e => {
      this.send(`window-close-${windowId}`);
    });

    newWindow.on('ready-to-show', (event) => {
      // newWindow.setAlwaysOnTop(true, 'floating', 3);
      const position = getWindowPosition(newWindow, options.position);

      newWindow.setPosition(position.x, position.y);

      if (options.displayId) {
        const display = screen.getAllDisplays().find(d => d.id === parseInt(options.displayId));

        if (display) {
          newWindow.setPosition(display.bounds.x, display.bounds.y);

          if (options.maximize) {
            newWindow.setSize(display.bounds.width, display.bounds.height);
            newWindow.setAlwaysOnTop(true, 'pop-up-menu');
          }
        }
      }

      if (options.visibleOnAllWorkspaces) {
        newWindow.setVisibleOnAllWorkspaces(true);
      }

      if (windowOptions.alwaysOnTop) {
        newWindow.setAlwaysOnTop(true, 'floating', 3);
      }

      newWindow.show();
    });

    newWindow.on('blur', (event) => {
      this.sendAll(`window-blur-${windowId}`);
    });
    newWindow.on('focus', (event) => {
      this.sendAll(`window-focus-${windowId}`);
    });

    return windowId;
  }

  /**
   * Open specific url in window
   * @param {string} id window's id
   * @param {string} route route to move to
   * @param {string} url url to move to (if not index.html)
   * @returns {void}
   */
  openUrl(id, route, url = 'index.html') {
    const devUrl = process.env.WEBPACK_DEV_SERVER_URL + url + '#' + route;
    const prodUrl = 'heyka://./' + url + '#' + route;

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      this.windows[id].loadURL(devUrl);
      // if (!process.env.IS_TEST) {
      //   newWindow.webContents.openDevTools();
      // }
    } else {
      this.windows[id].loadURL(prodUrl);
    }
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

  /**
   * Toggle fullscreen mode
   * @param {string} windowId ID of window in question
   * @returns {void}
   */
  toggleFullscreenWindow(windowId) {
    this.windows[windowId].setFullScreen(!this.windows[windowId].isFullScreen());
  }

  /**
   * Set's size of the window
   * @param {string} id – window id
   * @param {number} width – window width
   * @param {number} height – window height
   * @returns {void}
   */
  sizeWindow({ id, width, height }) {
    if (this.windows[id]) {
      this.windows[id].setSize(width, height);
      adjustBounds(this.windows[id]);
    }
  }

  /**
   * Set's main window id
   * @param {string} windowId – main window id
   * @returns {void}
   */
  setMainWindowId(windowId) {
    this.mainWindowId = windowId;
  }

  /**
   * Send message to main window
   * @param {string} event – event name
   * @param {*} [data] – event data
   * @returns {void}
   */
  send(event, data) {
    if (this.windows[this.mainWindowId]) {
      this.windows[this.mainWindowId].webContents.send(event, data);
    }
  }

  /**
   * Send message to ALL windows
   * @param {string} event – event name
   * @param {*} [data] – event data
   * @returns {void}
   */
  sendAll(event, data = null) {
    const windows = BrowserWindow.getAllWindows();

    windows.forEach((w) => {
      w.webContents.send(event, data);
    });
  }

  /**
   * Close ALL windows EXCEPT main window
   * @returns {void}
   */
  closeAll() {
    for (const w in this.windows) {
      if (w != this.mainWindowId) {
        this.closeWindow(w);
      }
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
