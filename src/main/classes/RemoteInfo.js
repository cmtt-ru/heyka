import { ipcMain, app, nativeTheme } from 'electron';

/**
 * subscribe to ipc events which replased "remote" module
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

ipcMain.on('remote-quit', () => {
  app.quit();
});
ipcMain.on('remote-restart', () => {
  app.relaunch();
  app.exit();
});
