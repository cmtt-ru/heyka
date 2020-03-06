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
    // if (!process.env.IS_TEST) {
    // mainWindow.webContents.openDevTools();
    // }
  } else {
    mainWindow.loadURL('heyka://./index.html');
  }
  // mainWindow.setProgressBar(-1); // hack: force icon refresh

  ipcMain.on('StartChannel', (event, args) => {
    // console.log(args);
    if (nativeTheme.shouldUseDarkColors) {
      console.log('dark!');
      mainWindow.webContents.send('theme-dark', 'whoooooooh!');
    }
    if (process.platform != 'darwin') {
      deeplinkingUrl = process.argv.slice(1);
    }
    logEverywhere('createWindow# ' + deeplinkingUrl);

    mainWindow.show();
    if (loadingScreen) {
      loadingScreen.close();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    // loadingScreen.hide();
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

// Protocol handler for osx
app.on('open-url', function (event, u) {
  event.preventDefault();
  console.log(u);
  logEverywhere('open-url# ' + u);
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