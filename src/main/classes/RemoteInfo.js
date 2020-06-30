import { ipcMain, app, nativeTheme } from 'electron';

/**
 * A class that replaced "remote" module
 * with the help of ipc
 */
class RemoteInfo {
  /**
   * Inits RemoteInfo class,subscribes to ipc events
   */
  constructor() {
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
  }
}

export default new RemoteInfo();