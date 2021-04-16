import path from 'path';
import log from 'electron-log';
import { ipcMain, app } from 'electron';
import os from 'os';

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

/**
 * Sho app launched log and some useful information about computer
 */
const mb = 1048576;
const cpus = os.cpus();

console.log(`\n\n
 █████╗ ██████╗ ██████╗     ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗███████╗██████╗
██╔══██╗██╔══██╗██╔══██╗    ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██╔════╝██╔══██╗
███████║██████╔╝██████╔╝    ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╗  ██║  ██║
██╔══██║██╔═══╝ ██╔═══╝     ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔══╝  ██║  ██║
██║  ██║██║     ██║         ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║███████╗██████╔╝
╚═╝  ╚═╝╚═╝     ╚═╝         ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝

App version: ${app.getVersion()}
OS: ${os.type()}
CPU: ${cpus[0].model} / ${cpus.length} cores
RAM: ${Math.round(os.totalmem() / mb)}MB
`);
