import { ipcMain, app, nativeTheme, systemPreferences, Menu, screen } from 'electron';
import shutdown from 'electron-shutdown-command';
import { IS_WIN } from '../Constants';
import WindowManager from '../../shared/WindowManager/WindowManagerMain';

/**
 * Subscribe to ipc events which replaced "remote" module
 */
ipcMain.on('remote-getLocale', (event) => {
  event.returnValue = app.getLocale();
});

ipcMain.on('remote-getPath', (event, path) => {
  event.returnValue = app.getPath(path);
});

ipcMain.on('remote-getVersion', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('remote-shouldUseDarkColors', (event) => {
  event.returnValue = nativeTheme.shouldUseDarkColors;
});

ipcMain.handle('remote-systemPreferences-microphone', async (event) => {
  return systemPreferences.getMediaAccessStatus('microphone');
});

ipcMain.handle('remote-media-access-status', async (event) => {
  const states = {
    microphone: await systemPreferences.getMediaAccessStatus('microphone'),
    camera: await systemPreferences.getMediaAccessStatus('camera'),
    screen: await systemPreferences.getMediaAccessStatus('screen'),
  };

  return states;
});

ipcMain.handle('remote-ask-for-media-access', async (event, mediaType) => {
  if (IS_WIN) {
    return 'granted';
  }

  return await systemPreferences.askForMediaAccess(mediaType);
});

ipcMain.handle('remote-get-all-displays', async (event) => {
  return screen.getAllDisplays();
});

ipcMain.on('remote-shutdown', (event) => {
  shutdown();
});

ipcMain.on('remote-quit', () => {
  app.quit();
});

ipcMain.on('remote-restart', () => {
  app.relaunch();
  app.exit();
});

/**
 * Context menu for text manipulations
 * @type {Electron.Menu}
 */
const InputMenu = Menu.buildFromTemplate([
  {
    label: 'Cut',
    role: 'cut',
  },
  {
    label: 'Copy',
    role: 'copy',
  },
  {
    label: 'Paste',
    role: 'paste',
  },
  {
    type: 'separator',
  },
  {
    label: 'Select all',
    role: 'selectall',
  },
]);

ipcMain.handle('open-input-context-menu', async (event, windowId) => {
  InputMenu.popup(WindowManager.getWindow(windowId));

  return true;
});
