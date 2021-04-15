import path from 'path';
import log from 'electron-log';
import { ipcMain } from 'electron';

let LOG_PATH = '';

log.transports.file.resolvePath = (variables) => {
  LOG_PATH = variables.libraryDefaultDir;

  return path.join(LOG_PATH, 'main.log');
};

ipcMain.on('log-manager-path', (event, name) => {
  event.returnValue = path.join(LOG_PATH, `${name}.log`);
});

log.catchErrors();

Object.assign(console, log.functions);
