import path from 'path';
import log from 'electron-log';
import { ipcMain, app, shell } from 'electron';
import os from 'os';
import osName from 'os-name';
import AdmZip from 'adm-zip';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import { API_URL } from '../Constants';
import { authFileStore } from '../localStore';

const asyncFs = fs.promises;

export const autoupdaterLogger = log.create('autoupdater');

const MAIN_LOG_NAME = 'main.log';
const AUTO_UPDATER_LOG_NAME = 'autoupdater.log';
const ARCHIVE_NAME = 'archive.zip';

let LOG_PATH = '';
let ARCHIVE_PATH = '';

/**
 * Setting log path & name
 * @param {object} variables – useful system paths
 * @returns {string}
 */
log.transports.file.resolvePath = (variables) => {
  LOG_PATH = variables.libraryDefaultDir;

  return path.join(LOG_PATH, MAIN_LOG_NAME);
};

/**
 * Setting auto updater log path & name
 * @returns {string}
 */
autoupdaterLogger.transports.file.resolvePath = () => {
  return path.join(LOG_PATH, AUTO_UPDATER_LOG_NAME);
};

/**
 * Include uncaught & promise errors in logs
 */
log.catchErrors();

/**
 * Extend console with electron-log methods
 */
Object.assign(console, log.functions);

/**
 * Returns log path to renderer process
 */
ipcMain.on('log-manager-path', (event, name) => {
  event.returnValue = path.join(LOG_PATH, `${name}.log`);
});

/**
 * Event for sending logs to server
 */
ipcMain.on('log-manager-send', (event, name) => {
  sendLogs();
});

/**
 * Event for opening logs folder
 */
ipcMain.on('log-manager-open-logs', (event, name) => {
  openLogsFolder();
});

/**
 * Send logs to server
 * @returns {Promise<void>}
 */
async function sendLogs() {
  await makeZip();

  const form = new FormData();
  const accessToken = await authFileStore.get('accessToken');

  form.append('logs', fs.createReadStream(ARCHIVE_PATH));

  const request = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...form.getHeaders(),
    },
  };

  try {
    await axios.post(`${API_URL}/logs`, form, request);

    await clearLogs();
  } catch (e) {
    console.error('AutoLaunch --> error', e);
  }
}

/**
 * Make zip archive with all logs
 * @returns {void}
 */
async function makeZip() {
  const zip = new AdmZip();
  const files = await getLogFileNames();

  /** Adding files to archive */
  files.forEach(file => zip.addLocalFile(path.join(LOG_PATH, file)));

  ARCHIVE_PATH = path.join(LOG_PATH, ARCHIVE_NAME);

  /** Write archive to file */
  zip.writeZip(ARCHIVE_PATH);
}

/**
 * Get log file names
 * @returns {Promise<array>}
 */
async function getLogFileNames() {
  const extensions = [ '.log' ];

  try {
    const files = await asyncFs.readdir(LOG_PATH);

    return files.filter(f => extensions.includes(path.extname(f).toLowerCase()));
  } catch (e) {
    console.error('AutoLaunch --> error', e);
  }
}

/**
 * Clear log files
 * @returns {Promise<void>}
 */
async function clearLogs() {
  const files = await getLogFileNames();

  files.forEach(file => asyncFs.unlink(path.join(LOG_PATH, file)));
}

/**
 * Open logs folder
 * @returns {Promise<void>}
 */
function openLogsFolder() {
  shell.openPath(LOG_PATH);
}

/**
 * Show app launched log and some useful information about computer
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
OS: ${osName()} ${os.release()}
CPU: ${cpus[0].model} / ${cpus.length} cores
RAM: ${Math.round(os.totalmem() / mb)}MB
`);
