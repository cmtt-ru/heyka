'use strict';

import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
// const path = require('path');
// const url = require('url');
const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow,
    loadingScreen,
    deeplinkingUrl;

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

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    mainWindow.loadURL('heyka://./index.html');
  }

  ipcMain.on('StartChannel', (event, args) => {
    if (nativeTheme.shouldUseDarkColors) {
      mainWindow.webContents.send('theme-dark', 'whoooooooh!');
    }
    if (process.platform !== 'darwin') {
      deeplinkingUrl = process.argv.slice(1);
    }
    logEverywhere('createWindow# ' + deeplinkingUrl);

    mainWindow.show();
    mainWindow.webContents.openDevTools();
    if (loadingScreen) {
      loadingScreen.close();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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
  }
});

app.on('ready', async () => {
  createProtocol('heyka');
  // load splash screen (fast) and start loading main screen (not so fast)
  createLoadingScreen();
  createWindow();
});

app.on('will-finish-launching', function () {
  // Protocol handler for osx
  app.on('open-url', function (event, url) {
    event.preventDefault();
    deeplinkingUrl = url;
    logEverywhere('openurl#' + url);
  });
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
function logEverywhere(s) {
  console.log(s);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
    mainWindow.webContents.send('deep-link', s);
  }
}