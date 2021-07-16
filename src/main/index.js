'use strict';

import { app, ipcMain, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import './classes/LogManager';
import './classes/AutoLaunch';
import './classes/RemoteInfo';
import './classes/HttpServer';
import WindowManager from '../shared/WindowManager/WindowManagerMain';
import { IS_DEV, IS_WIN, IS_MAC, IS_LINUX } from './Constants';
import MainWindowManager from '../shared/MainWindow/Main';

const gotTheLock = app.requestSingleInstanceLock();

let mainWindowId = null;

protocol.registerSchemesAsPrivileged([ {
  scheme: 'heyka',
  privileges: {
    secure: true,
    standard: true,
    corsEnabled: true,
    supportFetchAPI: true,
  },
} ]);
app.setAsDefaultProtocolClient('heyka');

if (IS_LINUX) {
  app.disableHardwareAcceleration();
}

app.on('window-all-closed', () => {
  if (!IS_MAC) {
    app.quit();
  }
});

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindowId === null) {
      mainWindowId = MainWindowManager.createWindow();
    } else {
      MainWindowManager.show();
    }
  });
}

app.on('ready', async () => {
  console.log('main/index.js --> app.on ready', mainWindowId, gotTheLock);
  if (mainWindowId !== null || !gotTheLock) {
    return;
  }
  createProtocol('heyka');
  mainWindowId = MainWindowManager.createWindow();
});

// trigger flag in WindowManager so that windows won't prevent closing
app.on('before-quit', function (e) {
  console.log('main/index.js --> before-quit', mainWindowId);
  WindowManager.willQuit();
});

// Open external links (with target="_blank") in browser
app.on('web-contents-created', (e, contents) => {
  contents.on('new-window', (el, url) => {
    el.preventDefault();
    require('open')(url);
  });
  contents.on('will-navigate', (el, url) => {
    if (url !== contents.getURL()) {
      require('open')(url);
      el.preventDefault();
    }
  });
});

// Exit cleanly on request from parent process in development mode.
if (IS_DEV) {
  if (IS_WIN) {
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

ipcMain.handle('open-webrtc-internals', async (event) => {
  createWebrtcInternals();

  return true;
});

ipcMain.handle('open-chrome-tracing', async (event) => {
  createChromeTracing();

  return true;
});

ipcMain.on('exit-fullscreen', (event) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  if (focusedWindow.isFullScreen()) {
    focusedWindow.setFullScreen(false);
  }
});

/**
 * Create webrtc internals window
 * @returns {void}
 */
function createWebrtcInternals() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadURL('chrome://webrtc-internals');
}

/**
 * Create chrome tracing window
 * @returns {void}
 */
function createChromeTracing() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadURL('chrome://tracing');
}
