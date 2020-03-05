'use strict';

import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib';
// const path = require('path');
// const url = require('url');
const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
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

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([ {
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true,
  },
} ]);
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
    createProtocol('app');
    mainWindow.loadURL('app://./index.html');
  }
  // mainWindow.setProgressBar(-1); // hack: force icon refresh

  ipcMain.on('StartChannel', (event, args) => {
    // console.log(args);
  // if (nativeTheme.shouldUseDarkColors) {
  //   console.log('dark!');
  //   mainWindow.webContents.send('theme-dark', 'whoooooooh!');
  // }
    mainWindow.show();
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
    createProtocol('app');
    loadingScreen.loadFile('splash.html');
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
  // load splash screen (fast) and start loading main screen (not so fast)
  createLoadingScreen();
  createWindow();
});

// Protocol handler for osx
app.on('open-url', function (event, u) {
  event.preventDefault();

  console.log('open-url# ' + u);
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
