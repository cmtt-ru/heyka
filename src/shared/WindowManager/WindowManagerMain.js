import path from 'path';
import { ipcMain, BrowserWindow, screen, Menu, nativeImage, app } from 'electron';
import Positioner from './Positioner';
import adjustBounds from '@/main/libs/adjustWindowBounds';
import templates from './templates.json';
import { v4 as uuidV4 } from 'uuid';
import cloneDeep from 'clone-deep';
import { IS_WIN, IS_DEV, IS_LINUX } from '../../sdk/Constants';
let icon;

if (IS_WIN) {
  icon = nativeImage.createFromPath(path.join(__static, `trayIcons/icon-onair-1.png`));
} else {
  icon = nativeImage.createFromPath(path.join(__static, `icon.png`));
}

const DEFAULT_WINDOW_OPTIONS = Object.freeze({
  width: 780,
  height: 560,
  x: 0,
  y: 0,
  // backgroundColor: '#000000', //! need to set same color as main bg color of theme
  frame: false,
  fullscreenable: false,
  show: false,
  icon: icon,
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
   * Inits window manager class, assigns mainwindow
   */
  constructor() {
    this.windows = [];
    this.quitting = false;
    this.events = {
      show: this.showWindow,
      hide: this.hideWindow,
      close: this.closeWindow,
      minimize: this.minimizeWindow,
      showInactive: this.showInactiveWindow,
      focus: this.focusWindow,
      blur: this.blurWindow,
      size: this.sizeWindow,
      fullscreen: this.toggleFullscreenWindow,
      console: this.toggleConsoleWindow,
      reload: this.reloadWindow,
      openurl: this.openUrl,
      willQuit: this.willQuit,
    };

    ipcMain.on('window-manager-event', (event, options) => {
      if (this.events[options.event] === undefined) {
        return;
      }
      this.events[options.event].call(this, options);
      event.returnValue = true;
    });

    ipcMain.on('window-manager-create', (event, options) => {
      const windowId = this.createWindow(options);

      event.returnValue = {
        id: windowId,
      };
    });

    ipcMain.on('window-manager-is-main-window', (event, options) => {
      event.returnValue = this.mainWindowId === options.id;
    });

    ipcMain.on('window-manager-is-fullscreen', (event, options) => {
      event.returnValue = this.getWindow(options.id).isFullScreen();
    });

    app.on('ready', () => {
      screen.on('display-removed', () => {
        for (const window in this.windows) {
          this.windows[window].positioner.bringWindowInView();
        }
      });

      screen.on('display-metrics-changed', () => {
        for (const window in this.windows) {
          this.windows[window].positioner.bringWindowInView();
        }
      });
    });
  }

  /**
   * Tell WindowManager that app is closing and we should force-close the windows
   * @returns {void}
   */
  willQuit() {
    this.quitting = true;
    console.log('willQuit');
  }

  /**
   * Get BrowserWindow instance by ID
   * @param {string} id - window ID
   * @returns {object} BrowserWindow instance
   */
  getWindow(id) {
    return this.windows[id].browserWindow;
  }

  /**
   * Create secondary Window
   * @param {object} options - mainWindow instance
   * @returns {string} ID of created window
   */
  createWindow(options) {
    const windowId = uuidV4();

    // clone template if found
    if (options.template && templates[options.template]) {
      options.window = Object.assign(cloneDeep(templates[options.template]), cloneDeep(options.window));
    }

    // mix in default window options
    const windowOptions = Object.assign(cloneDeep(DEFAULT_WINDOW_OPTIONS), cloneDeep(options.window));

    // add global argument so we can identify window by its id
    windowOptions.webPreferences.additionalArguments = [ '--window-id=' + windowId ];

    if (IS_LINUX && options.displayId) {
      let display = null;

      console.log('source index', options.sourceIndex);

      if (options.displayId && typeof options.sourceIndex !== 'number') {
        display = screen.getAllDisplays().find(d => d.id === parseInt(options.displayId));
      } else {
        display = screen.getAllDisplays()[options.sourceIndex];
      }

      console.log(display);
      windowOptions.x = display.bounds.x;
      windowOptions.y = display.bounds.y;
      windowOptions.width = display.bounds.width;
      windowOptions.height = display.bounds.height;
    }

    // create BrowserWindow!
    const browserWindow = new BrowserWindow(windowOptions);

    // add window to WindowManager's array; also save options for later
    this.windows[windowId] = {
      browserWindow,
      options,
      positioner: new Positioner(browserWindow),
    };

    // remove menu in prod
    if (!IS_DEV) {
      Menu.setApplicationMenu(null);
    }

    // set mouseEvents mode
    if (options.ignoreMouseEvents) {
      browserWindow.setIgnoreMouseEvents(true);
    }

    // open route and url from options
    this.openUrl({
      id: windowId,
      route: options.route,
      url: options.url,
    });

    // listen to "close" event so we can prevent closing if needed
    browserWindow.on('close', e => {
      console.log('closing:', windowId, this.mainWindowId);
      if (this.windows[windowId].options.preventClose && !this.quitting) {
        e.preventDefault();
        browserWindow.hide();
      }
    });

    // listen to "closed" event so we can clean up stuff and tell renderer that window is closed
    browserWindow.on('closed', e => {
      console.log('closed:', windowId, ', mainWindow:', this.mainWindowId);
      try {
        delete this.windows[windowId];
        this.send(`window-close-${windowId}`);
      } catch (error) {
        console.error('window already closed');
      }
    });

    // listen to "ready-to-show" event so we can show and position our window
    browserWindow.on('ready-to-show', (event) => {
      // positioning stuff
      // browserWindow.setAlwaysOnTop(true, 'floating', 3);
      const position = this.__getWindowPosition(browserWindow, options.position, options.margin);

      browserWindow.setPosition(position.x, position.y);

      if (options.displayId || options.sourceIndex) {
        let display = null;

        if (options.displayId && typeof options.sourceIndex !== 'number') {
          display = screen.getAllDisplays().find(d => d.id === parseInt(options.displayId));
        } else {
          display = screen.getAllDisplays()[options.sourceIndex];
        }

        if (display) {
          browserWindow.setPosition(display.bounds.x, display.bounds.y);

          if (options.maximize) {
            browserWindow.setSize(display.bounds.width, display.bounds.height);
            browserWindow.setAlwaysOnTop(true, 'pop-up-menu');
          }
        }
      }

      if (options.visibleOnAllWorkspaces) {
        browserWindow.setVisibleOnAllWorkspaces(true);
      }

      if (windowOptions.alwaysOnTop) {
        browserWindow.setAlwaysOnTop(true, 'pop-up-menu');
      }

      // retrieve window position and size
      if (options.windowPosition) {
        if (options.windowPosition.size) {
          this.windows[windowId].positioner.resize(options.windowPosition);
        }
        this.windows[windowId].positioner.moveXYscreen(options.windowPosition);
      }

      // "show window" stuff
      if (options.showInactive) {
        browserWindow.showInactive();
      } else {
        browserWindow.show();
      }
    });

    // tell renderer about blur, focus and hide events
    browserWindow.on('blur', (event) => {
      this.sendAll(`window-blur-${windowId}`);
    });
    browserWindow.on('focus', (event) => {
      this.sendAll(`window-focus-${windowId}`);
    });
    browserWindow.on('hide', (event) => {
      this.sendAll(`window-hide-${windowId}`);
    });

    // return this window Id after it's created
    return windowId;
  }

  /**
 * Adjust window position in regard to tray
 * @param {object} wnd - window instance
 * @param {string} pos - window position
 * @param {number} margin margin from window borders
 * @returns {object} adjusted window coordinates
 */
  __getWindowPosition(wnd, pos = 'center', margin) {
    const positioner = new Positioner(wnd, margin);

    return positioner.calculate(pos);
  }

  /**
   * Open specific url in window
   * @param {string} id - window's id
   * @param {string} route - route to move to
   * @param {string} url - url to move to (if not index.html)
   * @returns {void}
   */
  openUrl({ id, route, url = 'index.html' }) {
    const devUrl = process.env.WEBPACK_DEV_SERVER_URL + url + '#' + route;
    const prodUrl = 'heyka://./' + url + '#' + route;

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      this.windows[id].browserWindow.loadURL(devUrl);
    } else {
      this.windows[id].browserWindow.loadURL(prodUrl);
    }
  }

  /**
   * Set window position
   * @param {object} window - window instance
   * @param {string} pos - position of window
   * @returns {string} ID of created window
   */
  setPosition(window, pos = 'center') {
    const position = this.__getWindowPosition(window, pos);

    window.setPosition(position.x, position.y);
  }

  /**
   * Destroy window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  closeWindow({ id }) {
    if (this.windows[id] !== undefined) {
      try {
        this.windows[id].browserWindow.destroy();
        delete this.windows[id];
      } catch (e) {
        console.error('window already closed');
      }
    }
  }

  /**
   * Minimize window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  minimizeWindow({ id }) {
    if (this.windows[id] !== undefined) {
      this.windows[id].browserWindow.minimize();
    }
  }

  /**
   * Hide window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  hideWindow({ id }) {
    if (this.windows[id]) {
      this.windows[id].browserWindow.hide();
    }
  }

  /**
   * Show window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  showWindow({ id }) {
    if (this.windows[id]) {
      this.windows[id].browserWindow.show();
    }
  }

  /**
   * Show window inactive
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  showInactiveWindow({ id }) {
    if (this.windows[id]) {
      this.windows[id].browserWindow.showInactive();
    }
  }

  /**
   * Focus window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  focusWindow([ id ]) {
    if (this.windows[id]) {
      this.windows[id].browserWindow.focus();
    }
  }

  /**
   * Blur window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  blurWindow({ id }) {
    if (this.windows[id]) {
      this.windows[id].browserWindow.blur();
    }
  }

  /**
   * Toggle fullscreen mode
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  toggleFullscreenWindow({ id }) {
    this.windows[id].browserWindow.setFullScreen(!this.windows[id].isFullScreen());
  }

  /**
   * Toggle console visibility
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  toggleConsoleWindow({ id }) {
    this.windows[id].browserWindow.webContents.toggleDevTools();
  }

  /**
   * Reload window
   * @param {string} id - ID of window in question
   * @returns {void}
   */
  reloadWindow({ id }) {
    this.windows[id].browserWindow.reload();
  }

  /**
   * Set's size of the window
   * @param {string} id – window id
   * @param {number} width – window width
   * @param {number} height – window height
   * @returns {void}
   */
  sizeWindow({ id, width, height, margin }) {
    if (this.windows[id]) {
      const isResizable = this.windows[id].browserWindow.resizable;

      if (!isResizable) {
        this.windows[id].browserWindow.setResizable(true);
      }
      this.windows[id].browserWindow.setSize(width, height);
      if (!isResizable) {
        this.windows[id].browserWindow.setResizable(false);
      }
      adjustBounds(this.windows[id].browserWindow, margin);
    }
  }

  /**
   * Set's main window id
   * @param {string} id – main window id
   * @returns {void}
   */
  setMainWindowId(id) {
    this.mainWindowId = id;
  }

  /**
   * Send message to main window
   * @param {string} event – event name
   * @param {*} [data] – event data
   * @returns {void}
   */
  send(event, data) {
    try {
      this.windows[this.mainWindowId].browserWindow.webContents.send(event, data);
    } catch (err) {
      console.log('could not send to renderer');
    }
  }

  /**
   * Send message to ALL windows
   * @param {string} event – event name
   * @param {*} [data] – event data
   * @returns {void}
   */
  sendAll(event, data = null) {
    for (const w in this.windows) {
      try {
        this.windows[w].browserWindow.webContents.send(event, data);
      } catch (err) {
        console.log('could not send, this window is destroyed:', w);
      }
    }
  }

  /**
   * Close ALL windows EXCEPT main window
   * @returns {void}
   */
  closeAll() {
    for (const w in this.windows) {
      if (w !== this.mainWindowId) {
        this.closeWindow({ id: w });
      }
    }
  }
}

export default new WindowManager();
