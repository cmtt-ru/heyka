import { autoUpdater } from 'electron-updater';
import WindowManager from '../../shared/WindowManager/WindowManagerMain';
import { ipcMain } from 'electron';

/**
 * Check for update timeout
 * @type {number}
 */
const CHECK_FOR_UPDATE_TIMEOUT = 600000;

let updateTimer;
let updateDownloaded = false;
let updateDownloading = false;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

export default {
  /**
   * Init auto update
   * @param {BrowserWindow} mainWindow – main window
   * @returns {void}
   */
  init(mainWindow) {
    ipcMain.on('update-check', () => {
      console.log('\n-------- update check -------- ');
      console.log('updateDownloaded', updateDownloaded);
      console.log('updateDownloading', updateDownloading);
      if (updateDownloaded) {
        mainWindow.webContents.send('update-downloaded', true);
      } else if (updateDownloading) {
        mainWindow.webContents.send('update-downloading');
      } else {
        this.checkForUpdates();
        this.startTimer();
      }
    });

    ipcMain.on('update-install', () => {
      WindowManager.willQuit();
      setImmediate(() => {
        autoUpdater.quitAndInstall();
      });
    });

    autoUpdater.on('error', (error) => {
      mainWindow.webContents.send('update-error', JSON.stringify(error));
    });

    autoUpdater.on('update-available', () => {
      this.stopTimer();
      mainWindow.webContents.send('update-available');

      updateDownloaded = false;
      updateDownloading = true;
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

      updateDownloaded = false;
      updateDownloading = true;
    });

    autoUpdater.on('update-downloaded', () => {
      updateDownloaded = true;
      updateDownloading = false;
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
    this.stopTimer();
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
