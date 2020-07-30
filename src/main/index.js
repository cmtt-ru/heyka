'use strict';

import { app, ipcMain, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import './classes/AutoLaunch';
import './classes/RemoteInfo';
import WindowManager from '../shared/WindowManager/WindowManagerMain';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { IS_DEV, IS_WIN, IS_MAC } from '../shared/Constants';
import MainWindowManager from '../shared/MainWindow/Main';

console.time('init');
console.time('before-load');

let mainWindowId,
    loadingScreenID;

protocol.registerSchemesAsPrivileged([ {
  scheme: 'heyka',
  privileges: {
    secure: true,
    standard: true,
  },
} ]);
app.setAsDefaultProtocolClient('heyka');

/**
 * Create Splash window
 * @returns {void}
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
  if (!IS_MAC) {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindowId === null) {
    mainWindowId = MainWindowManager.createWindow();
  } else {
    MainWindowManager.show();
  }
});

app.on('second-instance', () => {
  if (mainWindowId === null) {
    mainWindowId = MainWindowManager.createWindow();
  } else {
    MainWindowManager.show();
  }
});

app.on('ready', async () => {
  createProtocol('heyka');
  // load splash screen (fast) and start loading main screen (not so fast)
  createLoadingScreen();
  mainWindowId = MainWindowManager.createWindow();

  ipcMain.on('page-rendered', () => {
    if (loadingScreenID) {
      console.timeEnd('init');
      WindowManager.closeWindow({ id: loadingScreenID });
      loadingScreenID = null;
    }
  });

  /**
   * Vue devtools chrome extension
   */
  if (IS_DEV) {
    installExtension(VUEJS_DEVTOOLS)
      .then(() => {})
      .catch(err => {
        console.log('Unable to install `vue-devtools`: \n', err);
      });
  }
});

// trigger flag in WindowManager so that windows won't prevent closing
app.on('before-quit', function (e) {
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

ipcMain.on('open-webrtc-internals', (event) => {
  event.returnValue = true;
  createWebrtcInternals();
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
