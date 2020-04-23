import { ipcMain } from 'electron';
import AutoLaunch from 'auto-launch'; //! Not Mac App Store friendly
import Store from 'electron-store';
const autoLauncher = new AutoLaunch({
  name: 'Heyka 2.0',
});
const heykaStore = new Store({
  name: 'app',
});

const isDevelopment = process.env.NODE_ENV !== 'production';

if (!isDevelopment && heykaStore.get('autolaunch', true)) {
  autoLauncher.isEnabled().then(function (isEnabled) {
    if (isEnabled) {
      return;
    }
    autoLauncher.enable();
  })
    .catch(function (err) {
      console.log(err);
    });
}

ipcMain.on('app-toggle-autolaunch', (event, state) => {
  if (state) {
    autoLauncher.isEnabled().then(function (isEnabled) {
      if (isEnabled) {
        return;
      }
      autoLauncher.enable();
      console.log('autolaunch set');
    })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    autoLauncher.isEnabled().then(function (isEnabled) {
      if (!isEnabled) {
        return;
      }
      autoLauncher.disable();
      console.log('autolaunch unset');
    })
      .catch(function (err) {
        console.log(err);
      });
  }
});