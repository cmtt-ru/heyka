const electron = require('electron');
const Conf = require('conf');
const shutdown = require('electron-shutdown-command');

window.ipcRenderer = electron.ipcRenderer;
window.desktopCapturer = electron.desktopCapturer;
window.Conf = Conf;
window.shutdown = shutdown;
