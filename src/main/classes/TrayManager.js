import path from 'path';
import { app, Menu, Tray, nativeImage, nativeTheme, ipcMain } from 'electron';
import Store from 'electron-store';

const heykaStore = new Store({
  name: 'app',
});

const isMac = process.platform === 'darwin';
const isWin = !isMac;
let animationTimer;
const blurDebounce = 300;
const oneSecond = 1000;

/**
 * Icon names for dark&light themes. No ".png", no "@2x/@3x" stuff
 */
const icons = {
  light: {
    default: 'icon',
    'onair-1': 'icon-onair-1',
    'onair-2': 'icon-onair-2',
    crossed: 'icon-crossed',
  },
  dark: {
    default: 'icon-light',
    'onair-1': 'icon-onair-1',
    'onair-2': 'icon-onair-2',
    crossed: 'icon-crossed',
  },
};

let theme = 'light';

if ((isMac && nativeTheme.shouldUseDarkColors) || isWin) {
  theme = 'dark';
}

/**
 * A class that manages app living in tray
 */
class TrayManager {
  /**
 * Inits windowmanager class, assigns mainwindow
 * @param {string} iconPath path of tray icon file
 * @returns {void}
 */
  constructor(iconPath) {
    // Get behaviour from electron store.
    // It is set and changed bu vuex store,
    // but we don't need to communicate with vuex directly.
    // For now, at least.
    //
    this.mode = heykaStore.get('runAppFrom', 'window');
    this.lastBlurTime = 0;

    nativeTheme.on('updated', () => {
      this.updateTheme();
    });

    app.on('ready', () => {
      this.set(iconPath);

      // this.attachContextMenu();

      this.tray.on('click', (event) => {
        this.clickTray();
      });
      this.tray.on('double-click', (event) => {
        this.clickTray();
      });
      ipcMain.on('tray-animation', (event, state) => {
        if (state) {
          this.setAnimation();
        } else {
          this.stopAnimation();
        }
      });
    });
  }

  /**
 * Add mainWindow instance to TrayManager object
 * @param {string} window mainWindow instance
 * @returns {void}
 */
  bindMainWindow(window) {
    this.mainWindow = window;
  }

  /**
   * Toggle Mainwindow on tray click
   * @returns {void}
 */
  clickTray() {
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();

      return;
    }
    this.toggleMainWindow();
  }

  /**
    * Get icon full path by icon name.
    *! nativePath accepts only png and jpeg. No ico!
    * @param {string} icon icon path
    * @returns {string} icon full path
  */
  getIconPath(icon) {
    if (icons[theme][icon]) {
      return path.join(__static, `trayIcons/${icons[theme][icon]}.png`);
    } else {
      console.error(`Icon "${icon}" not found`);

      return false;
    }
  }

  /**
 * Change tray icon to desired, and create tray if none
  * @param {string} icon icon path
 * @returns {void}
 */
  set(icon) {
    const nImage = nativeImage.createFromPath(this.getIconPath(icon));

    if (this.tray === undefined) {
      this.tray = new Tray(nImage);
      this.tray.setIgnoreDoubleClickEvents(true);
    } else {
      this.tray.setImage(nImage);
    }
  }

  /**
    * get tray instance
    * @returns {object}
  */
  get() {
    return this.tray;
  }

  /**
 * Alternate tray icon between given icons
  * @param {array} iconsArray icons array
  * @param {number} interval interval between alternating icons
 * @returns {void}
 */
  setAnimation(iconsArray = ['onair-1', 'onair-2'], interval = oneSecond) {
    const iconsCount = iconsArray.length;
    let counter = 0;

    clearInterval(animationTimer);

    this.set(iconsArray[0]);

    animationTimer = setInterval(() => {
      counter++;

      if (counter >= iconsCount) {
        counter = 0;
      }

      this.set(iconsArray[counter]);
    }, interval);
  }

  /**
 * Stop tray animation
 * @returns {void}
 */
  stopAnimation() {
    clearInterval(animationTimer);
    this.set('default');
  }

  /**
 * Get tray icon bounds
 * @returns {object} Rectangle - x, y, width and height of icon
 */
  getBounds() {
    return this.tray.getBounds();
  }

  /**
 * Check if window lives in tray
 * @returns {boolean} if window lives in tray
 */
  isInTray() {
    if (this.mode === 'tray') {
      return true;
    }

    return false;
  }

  /**
   * Update tray icon when systemPrference has changed
   * @returns {void}
  */
  updateTheme() {
    if ((isMac && nativeTheme.shouldUseDarkColors) || isWin) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
    this.set('default');
  }

  /**
   * Attach context menu to tray
   * @returns {void}
   */
  attachContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      // { role: 'appMenu' }
      ...(isMac ? [ {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      } ] : []),

      // { role: 'viewMenu' }
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      // { role: 'windowMenu' }
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' },
          ] : [
            { role: 'close' },
          ]),
        ],
      },
      { type: 'separator' },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              const { shell } = require('electron');

              await shell.openExternal('https://electronjs.org');
            },
          },
        ],
      },
      ...(isMac ? [ {
        role: 'close',
        accelerator: 'CommandOrControl+Q',
        registerAccelerator: true,
      } ] : [ {
        role: 'quit',
        accelerator: 'CommandOrControl+Q',
        registerAccelerator: true,
      } ]),
    ]);

    // this.tray.setToolTip('You have 0 notifications');
    this.tray.setContextMenu(contextMenu);
  }

  /**
   * switch mainwindow's state between 'shown' and 'hidden'
   * @returns {void}
   */
  toggleMainWindow() {
    if (this.checkLastBlurTime()) {
      if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.show();
      }
    }
  }

  /**
   * sets LastBlurTime
   * @returns {void}
   */
  setLastBlurTime() {
    this.lastBlurTime = Date.now();
  }

  /**
   * Windows' bugfix
   * if you click on tray icon then blur event will be triggered first (mousedown for blur vs mouseup for tray click)
   *  @returns {boolean}
   */
  checkLastBlurTime() {
    const now = Date.now();

    return now - this.lastBlurTime > blurDebounce;
  }
}
export default new TrayManager('default');
