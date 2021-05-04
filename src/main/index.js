'use strict';

import { app, ipcMain, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import './classes/LogManager';
import './classes/AutoLaunch';
import './classes/RemoteInfo';
import './classes/HttpServer';
import WindowManager from '../shared/WindowManager/WindowManagerMain';
import { IS_DEV, IS_WIN, IS_MAC, IS_LINUX } from '../main/Constants';
import MainWindowManager from '../shared/MainWindow/Main';
import si from 'systeminformation';
import { setInterval } from 'requestanimationframe-timer';
import cloneDeep from 'clone-deep';
import sleep from 'es7-sleep';

console.time('init');
console.time('before-load');

let mainWindowId,
    loadingScreenID;

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

/**
 * Create Splash window
 * @returns {void}
 */
// function createLoadingScreen() {
// loadingScreenID = WindowManager.createWindow({
//     position: 'center',
//     template: 'splash',
//     url: 'splash.html',
// });
// console.timeEnd('before-load');
// }

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
  // createLoadingScreen();
  mainWindowId = MainWindowManager.createWindow();

  ipcMain.on('page-rendered', () => {
    if (loadingScreenID) {
      console.timeEnd('init');
      WindowManager.closeWindow({ id: loadingScreenID });
      loadingScreenID = null;
    }
  });

  while (true) {
    await sysInfo();

    // eslint-disable-next-line no-magic-numbers
    await sleep(5000);
  }
});

let processesPids = [];

async function sysInfo() {
  const processName = IS_DEV ? 'Electron' : 'Heyka';

  console.time('--- si exec');
  /** Check for count */
  if (processesPids.length === 0) {
    processesPids = await si.processLoad(processName);

    processesPids = processesPids[0].pids;
  }
  const { list } = await si.processes();

  // const processesPids = parentProcesses[0].pids;

  console.timeEnd('--- si exec');

  const appProcesses = list.filter(({ pid }) => processesPids.includes(pid));

  const result = {

  };

  appProcesses.forEach(proc => {
    /** Form process name */
    // const templateArg = proc.params
    //   .split(' ')
    //   .find(u => u.includes('template:'));
    //
    // let template = 'unknown';
    //
    // if (templateArg) {
    //   template = templateArg.split(':')[1];
    // }

    const name = `${proc.pid}:${proc.name}`;

    /** Save key for result */
    result[name] = {
      pid: proc.pid,
      cpu: proc.cpu,
      mem: proc.memRss,
    };
  });

  const cpuTotal = appProcesses.reduce((sum, proc) => {
    return sum + proc.cpu;
  }, 0);

  const memTotal = appProcesses.reduce((sum, proc) => {
    return sum + proc.memRss;
  }, 0);

  const b = 1024;

  result['total'] = {
    pid: 0,
    cpu: parseFloat(cpuTotal.toFixed(2)),
    mem: parseFloat((memTotal / b).toFixed(2)),
  };

  console.log('\n');
  console.table(result);

  // Object.keys(res).forEach(a => {
  //   console.log(a, res[a].length);
  // });

  // console.log('----------', appProcesses);
}

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
