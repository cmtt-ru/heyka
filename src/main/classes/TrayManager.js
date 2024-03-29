import path from 'path';
import OS from 'os';
import { app, Menu, Tray, nativeImage, nativeTheme, ipcMain } from 'electron';
import { IS_MAC, IS_LINUX } from '../../main/Constants';
import { heykaStore } from '../localStore';

let animationTimer;
const blurDebounce = 300;
const oneSecond = 1000;
const BIG_SUR_VERSION = 20;

/**
 * Icon names for dark&light themes. No ".png", no "@2x/@3x" stuff
 */
const icons = {
  light: {
    default: 'icon-light',
    'onair-1': 'icon-onair-1-light',
    'onair-2': 'icon-onair-2-light',
  },
  dark: {
    default: 'icon-dark',
    'onair-1': 'icon-onair-1-dark',
    'onair-2': 'icon-onair-2-dark',
  },
};

let theme = 'light';
let permanentTheme;

if ((IS_MAC && nativeTheme.shouldUseDarkColors) || !IS_MAC) {
  theme = 'dark';
}

if (IS_MAC && OS.release().split('.')[0] >= BIG_SUR_VERSION) {
  permanentTheme = 'dark';
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

      if (IS_LINUX) {
        this.tray.setContextMenu(Menu.buildFromTemplate([
          {
            label: 'Heyka',
            type: 'normal',
            click: () => {
              this.clickTray();
            },
          },
          {
            label: 'Quit',
            type: 'normal',
            role: 'quit',
          },
        ]));
      }

      this.tray.on('click', () => {
        this.clickTray();
      });

      this.tray.on('double-click', () => {
        this.clickTray();
      });

      this.tray.on('right-click', () => {
        this.tray.popUpContextMenu(Menu.buildFromTemplate([ {
          role: 'quit',
        } ]));
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
   * Toggle main window on tray click
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
      console.error(`TrayManager --> Icon "${icon}" not found`);

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
    if ((IS_MAC && nativeTheme.shouldUseDarkColors) || !IS_MAC) {
      theme = permanentTheme || 'dark';
    } else {
      theme = permanentTheme || 'light';
    }

    this.set('default');
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
        this.mainWindow.setVisibleOnAllWorkspaces(true);
        this.mainWindow.show();
        this.mainWindow.setVisibleOnAllWorkspaces(false);
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
