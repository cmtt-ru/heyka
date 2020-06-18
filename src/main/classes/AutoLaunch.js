import { ipcMain, app } from 'electron';
import AutoLaunch from 'auto-launch'; // ! Not Mac App Store friendly
import { IS_DEV } from '../../shared/Constants';
import { heykaStore } from '../../renderer/store/localStore';
const autoLauncher = new AutoLaunch({
  name: app.name,
});

/* Enable autolaunch if not in development mode and if setting is set to "true" */
if (!IS_DEV && heykaStore.get('autolaunch', true)) {
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
