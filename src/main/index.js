'use strict';

import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import Autoupdater from './classes/AutoUpdater';
import deepLink from '../shared/DeepLink/DeepLinkMain';
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow,
    loadingScreen;

const windowParams = {
  width: 1000,
  height: 700,
  show: false,
  webPreferences: {
    webSecurity: false,
    nodeIntegration: true,
  },
};

const splashParams = {
  width: 90,
  height: 90,
  show: false,
  frame: false,
  webPreferences: {
    webSecurity: false,
    nodeIntegration: true,
  },
};

app.setAsDefaultProtocolClient('heyka');

/**
 * Create the browser window
 * @returns {undefined} NOTHING
 */
function createWindow() {
  mainWindow = new BrowserWindow(windowParams);
  deepLink.bindMainWindow(mainWindow);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    mainWindow.loadURL('heyka://./index.html');
  }
  ipcMain.on('start-is-ready', () => {
    if (nativeTheme.shouldUseDarkColors) {
      mainWindow.webContents.send('theme-dark', 'theme-dark');
    }

    if (deepLink.getParams()) {
      mainWindow.webContents.send('deep-link', deepLink.getParams());
    } else {
      mainWindow.webContents.send('default-behaviour');
    }
  });

  ipcMain.on('page-rendered', (event, args) => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
    if (loadingScreen) {
      loadingScreen.close();
    }
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
  loadingScreen = new BrowserWindow(Object.assign(splashParams, { parent: mainWindow }));

  if (isDevelopment) {
    loadingScreen.loadURL(`file://${process.cwd()}/public/splash.html`);
  } else {
    loadingScreen.loadURL('heyka://./splash.html');
  }

  loadingScreen.on('closed', () => {
    loadingScreen = null;
  });

  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen.show();
  });
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

/**
 * Log both at dev console and at running node console instance
 * @param {string} s string to print
 * @returns {undefined} NOTHING
 */
// function logEverywhere(s) {
// console.log(s);
// if (mainWindow && mainWindow.webContents) {
//     mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
// }
// }