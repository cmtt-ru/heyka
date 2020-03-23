'use strict';

import { app, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import Autoupdater from './classes/AutoUpdater';
import TrayManager from './classes/TrayManager';
import DeepLink from '../shared/DeepLink/DeepLinkMain';
import WindowManager from '../shared/WindowManager/WindowManagerMain';
const isDevelopment = process.env.NODE_ENV !== 'production';

console.time('init');
console.time('before-load');

let mainWindow,
    loadingScreenID;

app.setAsDefaultProtocolClient('heyka');

/**
 * Create the browser window
 * @returns {void}
 */
function createWindow() {
  let params = {};

  if (TrayManager.isInTray()) {
    params = {
      position: 'tray',
      template: 'maintray',
    };
  } else {
    params = {
      position: 'center',
      template: 'main',
    };
  }

  const mainWindowid = WindowManager.createWindow(params);

  mainWindow = WindowManager.getWindow(mainWindowid);
  DeepLink.bindMainWindow(mainWindow);
  TrayManager.bindMainWindow(mainWindow);

  ipcMain.on('start-is-ready', () => {
    if (DeepLink.getParams()) {
      mainWindow.webContents.send('deep-link', DeepLink.getParams());
    } else {
      mainWindow.webContents.send('default-behaviour');
    }
  });

  ipcMain.on('page-rendered', (event, args) => {
    if (loadingScreenID) {
      console.timeEnd('init');
      WindowManager.closeWindow(loadingScreenID);
      loadingScreenID = null;
    }
    mainWindow.webContents.openDevTools();
  });

  if (!isDevelopment) {
    Autoupdater.init(mainWindow);
  }

  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && mainWindow.isVisible()) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

/**
 * Create Splash window
 * @returns {undefined} NOTHING
 */
function createLoadingScreen() {
  loadingScreenID = WindowManager.createWindow({
    position: 'center',
    template: 'splash',
    url: 'splash.html',
  });
  console.timeEnd('before-load');
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('ready', async () => {
  createProtocol('heyka');
  // load splash screen (fast) and start loading main screen (not so fast)
  createLoadingScreen();
  createWindow();
});

app.on('before-quit', function () {
  console.log('before-quit');
  mainWindow.hide();
});

app.on('will-quit', function () {
  console.log('will-quit');
  mainWindow = null;
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}