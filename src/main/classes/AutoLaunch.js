import { ipcMain, app } from 'electron';
import AutoLaunch from 'auto-launch'; // ! Not Mac App Store friendly
import { IS_DEV } from '../../main/Constants';
import { heykaStore } from '../localStore';
const autoLauncher = new AutoLaunch({
  name: app.name,
});

/* Enable autolaunch if not in development mode and if setting is set to "true" */
if (!IS_DEV && heykaStore.get('autorun', true)) {
  autoLauncher.isEnabled().then(function (isEnabled) {
    if (isEnabled) {
      return;
    }
    autoLauncher.enable();
  })
    .catch(function (err) {
      console.error('AutoLaunch --> error', err);
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
        console.error('AutoLaunch --> error', err);
      });
  } else {
    autoLauncher.isEnabled().then(function (isEnabled) {
      if (!isEnabled) {
        return;
      }
      autoLauncher.disable();
    })
      .catch(function (err) {
        console.error('AutoLaunch --> error', err);
      });
  }
});
