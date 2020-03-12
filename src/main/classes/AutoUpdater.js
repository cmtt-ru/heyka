import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

let updateTimer;

autoUpdater.autoDownload = false;

export default {

  init(mainWindow) {
    autoUpdater.on('error', (error) => {
      // console.log(error.toString());
      dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString());
    });

    autoUpdater.on('update-available', () => {
      this.stopTimer();
      mainWindow.webContents.send('update-available');

      //     dialog.showMessageBox({
      //      type: 'info',
      //      title: 'Heyka',
      //      noLink: true,
      //      message: 'Found updates, do you want update now?',
      //      defaultId: 0,
      //      buttons: ['Yes', 'No'],
      //    }, (buttonIndex) => {
      //      if (buttonIndex === 0) {
      //        autoUpdater.downloadUpdate();
      //      }
      //    });
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
      mainWindow.webContents.send('update-download-complete');

      //     dialog.showMessageBox({
      //      title: 'Heyka',
      //      type: 'question',
      //      noLink: true,
      //      defaultId: 0,
      //      buttons: ['Yes', 'Later'],
      //      message: 'Updates downloaded, do you wanna restart Heyka now?',
      //    }, (buttonIndex) => {
      //      if (buttonIndex === 0) {
      //        setImmediate(() => autoUpdater.quitAndInstall());
      //      }
      //    });
    });

    this.checkForUpdates();
    this.startTimer();
  },

  startTimer() {
    const tenMinutes = 600000;

    updateTimer = setInterval(() => {
      this.checkForUpdates();
    }, tenMinutes);
  },

  stopTimer() {
    clearInterval(updateTimer);
  },

  checkForUpdates() {
    autoUpdater.checkForUpdates();
  },

};