const electron = require('electron');
const electronLog = require('electron-log');

window.ipcRenderer = electron.ipcRenderer;
window.desktopCapturer = electron.desktopCapturer;
window.electronLog = electronLog;
