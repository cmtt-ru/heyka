import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';

/**
 * Check for update timeout
 * @type {number}
 */
const CHECK_FOR_UPDATE_TIMEOUT = 600000;

let updateTimer;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowPrerelease = true;
autoUpdater.channel = 'beta';

export default {
  /**
   * Init auto update
   * @param {BrowserWindow} mainWindow – main window
   * @returns {void}
   */
  init(mainWindow) {
    ipcMain.on('update-check', () => {
      this.checkForUpdates();
      this.startTimer();
    });

    ipcMain.on('update-install', () => {
      setImmediate(() => autoUpdater.quitAndInstall());
    });

    autoUpdater.on('error', (error) => {
      mainWindow.webContents.send('update-error', JSON.stringify(error));
    });

    autoUpdater.on('update-available', () => {
      this.stopTimer();
      mainWindow.webContents.send('update-available');
    });

    autoUpdater.on('update-not-available', () => {
      mainWindow.webContents.send('update-not-available');
    });

    autoUpdater.on('download-progress', (progressObj) => {
      mainWindow.webContents.send('update-download-progress', JSON.stringify({
        percent: progressObj.percent,
        speed: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total,
      }));
    });

    autoUpdater.on('update-downloaded', () => {
      mainWindow.webContents.send('update-downloaded');
    });

    autoUpdater.on('checking-for-update', () => {
      mainWindow.webContents.send('update-checking');
    });
  },

  /**
   * Start update interval
   * @returns {void}
   */
  startTimer() {
    updateTimer = setInterval(() => {
      this.checkForUpdates();
    }, CHECK_FOR_UPDATE_TIMEOUT);
  },

  /**
   * Stop update interval
   * @returns {void}
   */
  stopTimer() {
    clearInterval(updateTimer);
  },

  /**
   * Check for update
   * @returns {void}
   */
  checkForUpdates() {
    autoUpdater.checkForUpdates();
  },
};
