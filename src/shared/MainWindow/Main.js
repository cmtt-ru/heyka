import WindowManager from '../WindowManager/WindowManagerMain';
import TrayManager from '../../main/classes/TrayManager';
import DeepLink from '../DeepLink/DeepLinkMain';
import Autoupdater from '../../main/classes/AutoUpdater';
import { ipcMain, nativeTheme, powerMonitor, app } from 'electron';
import { heykaStore } from '@/store/localStore';
import { IS_DEV, IS_MAC } from '../Constants';

const resizeable = IS_DEV || heykaStore.get('resizeWindow', false);

let params = {};

if (TrayManager.isInTray()) {
  params = {
    position: 'tray',
    template: 'maintray',
    preventClose: true,
  };

  if (IS_MAC) {
    app.dock.hide();
  }
} else {
  params = {
    position: 'center',
    template: resizeable ? 'mainDev' : 'main',
    preventClose: true,
  };
}

/**
 * Class for controlling main window
 */
class MainWindow {
  /**
   * Main window constructor
   */
  constructor() {
    this.window = null;
    this.windowId = null;
  }

  /**
   * Show frame window
   * @param {string} displayId – display id
   * @returns {void}
   */
  show() {
    if (this.window === null) {
      this.createWindow();
    } else {
      this.window.show();
    }
  }

  /**
   * Hide main window
   * @returns {void}
   */
  hide() {
    if (this.window) {
      this.window.hide();
    }
  }

  /**
   * Create main window
   * @returns {string} main window ID
   */
  createWindow() {
    this.windowId = WindowManager.createWindow(params);
    this.window = WindowManager.getWindow(this.windowId);
    WindowManager.setMainWindowId(this.windowId);

    DeepLink.bindMainWindow(this.window);
    TrayManager.bindMainWindow(this.window);

    this._eventsSubscribe();

    return this.windowId;
  }

  /**
   * Main window subscriptions
   * @returns {void}
   */
  _eventsSubscribe() {
    if (!IS_DEV) {
      Autoupdater.init(this.window);
    }

    if (TrayManager.isInTray()) {
      const waitTime = 200;

      this.window.on('blur', () => {
        this.window.hide();
        // Reason for this timeout: we want to teleport window after closing animation is complete
        setTimeout(() => {
          WindowManager.setPosition(this.window, 'tray');
        }, waitTime);
        TrayManager.setLastBlurTime();
      });
    }

    nativeTheme.on('updated', () => {
      WindowManager.sendAll('native-theme-updated');
    });

    ipcMain.on('start-is-ready', () => {
      DeepLink.resendLast();
    });

    /**
     * Close all windows on main window refresh
     */
    this.window.webContents.on('did-finish-load', () => {
      WindowManager.closeAll();
    });

    /**
     * Power monitor events
     * Handle sleep / awake & lock / unlock screen events
     */
    powerMonitor.on('suspend', () => this.window.webContents.send('power-monitor-suspend', true));
    powerMonitor.on('resume', () => this.window.webContents.send('power-monitor-suspend', false));
    powerMonitor.on('lock-screen', () => this.window.webContents.send('power-monitor-lock-screen', true));
    powerMonitor.on('unlock-screen', () => this.window.webContents.send('power-monitor-lock-screen', false));
  }
}

export default new MainWindow();
