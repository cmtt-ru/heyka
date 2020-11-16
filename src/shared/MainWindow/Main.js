import WindowManager from '../WindowManager/WindowManagerMain';
import TrayManager from '../../main/classes/TrayManager';
import DeepLink from '../DeepLink/DeepLinkMain';
import Positioner from '../WindowManager/Positioner';
import Autoupdater from '../../main/classes/AutoUpdater';
import { ipcMain, nativeTheme, powerMonitor, app, globalShortcut } from 'electron';
import { heykaStore } from '../../renderer/store/localStore';
import { IS_DEV, IS_MAC } from '../../sdk/Constants';

const resizeable = heykaStore.get('resizeWindow', false);

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
    windowPosition: heykaStore.get('windowPosition'),
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
    this.positioner = null;
  }

  /**
   * Show main window
   *
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
    this.positioner = new Positioner(this.window);

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

    this.window.on('close', () => {
      const newPos = {
        x: this.window.getPosition()[0],
        y: this.window.getPosition()[1],
      };

      const newInfo = this.positioner.getCoordsAndScreen(newPos);

      newInfo.size = this.window.getSize();

      console.log('saving:', newInfo);
      heykaStore.set('windowPosition', newInfo);
    }

    );

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
     * Register global shortcuts
     */

    globalShortcut.register('CommandOrControl+Shift+M', () => {
      this.window.webContents.send('hotkey-mic');
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
