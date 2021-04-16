import path from 'path';
import log from 'electron-log';
import { ipcMain } from 'electron';

let LOG_PATH = '';

export const autoupdaterLogger = log.create('autoupdater');

log.transports.file.resolvePath = (variables) => {
  LOG_PATH = variables.libraryDefaultDir;

  return path.join(LOG_PATH, 'main.log');
};

autoupdaterLogger.transports.file.resolvePath = () => path.join(LOG_PATH, 'autoupdater.log');

ipcMain.on('log-manager-path', (event, name) => {
  event.returnValue = path.join(LOG_PATH, `${name}.log`);
});

log.catchErrors();

Object.assign(console, log.functions);
