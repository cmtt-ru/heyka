import { ipcMain } from 'electron';
import AutoLaunch from 'auto-launch'; // ! Not Mac App Store friendly
import Store from 'electron-store';
const autoLauncher = new AutoLaunch({
  name: 'Heyka 2.0', // ? retrieve name from outside? vuex store, maybe?
});
const heykaStore = new Store({
  name: 'app',
});

const isDevelopment = process.env.NODE_ENV !== 'production';

/* Enable autolaunch if not in development mode and if setting is set to "true" */
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

/* Listen to signal from renderer process and toggle autolaunch if needed */
ipcMain.on('app-toggle-autolaunch', (event, state) => {
  if (state) {
    autoLauncher.isEnabled().then(function (isEnabled) {
      if (isEnabled) {
        return;
      }
      autoLauncher.enable();
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
    })
      .catch(function (err) {
        console.log(err);
      });
  }
});