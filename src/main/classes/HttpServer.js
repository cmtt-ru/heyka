import { ipcMain } from 'electron';
import mainWindow from '../../shared/MainWindow/Main';
import * as http from 'http';

/**
 * Ports for local auth server
 * @type {number[]}
 */
// eslint-disable-next-line no-magic-numbers
const PORTS = [9615, 48757, 48852, 49057, 49086];

/**
 * Local http auth server instance
 * @type {Server}
 */
let localAuthServer = null;

/**
 * Subscribe to ipc events which replaced "remote" module
 */
ipcMain.on('http-create-server', () => {
  createLocalServer();
});

ipcMain.on('http-kill-server', () => {
  destroyLocalServer();
});

/**
 * Open web server to listen for magic login from web
 *
 * @param {number} portIndex - port to listen to
 * @returns {void}
 */
function createLocalServer(portIndex = 0) {
  if (portIndex === PORTS.length) {
    destroyLocalServer();

    return;
  }

  localAuthServer = http.createServer((req, res) => {
    mainWindow.window.webContents.send('http-magic-link', req.url.substr(1));
    res.end('heyka');
    destroyLocalServer();
  });

  localAuthServer.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      localAuthServer.close();
      createLocalServer(portIndex + 1);
    }
  });

  localAuthServer.listen(PORTS[portIndex], '127.0.0.1');
};

/**
 * Destroy local auth server
 * @returns {void}
*/
function destroyLocalServer() {
  if (localAuthServer) {
    localAuthServer.close();
    localAuthServer = null;
  }
}