import { app } from 'electron';

/**
 * Transforms deep link string to command with hash
 * @param {string} str deep link string
 * @returns {Object} object with command and hash
 */
function deepLinkDeconstruct(str) {
  if (str.indexOf('://') === -1) { // test deeplink
    return {
      command: 'join',
      hash: 'devMode 12357858',
    };
  }
  str = str.split('://')[1]; // remove app name, eg: 'heyka://'
  str = str.split('/');

  return {
    command: str[0],
    hash: str[1],
  };
}

/**
 * A class that handles Deep Links in main process
 */
export default class DeepLinkMain {
  /**
 * Inits deep link class
 * @param {Array} commandsArray legitimate commands
 * @param {object} mainWindow mainWindow instance
 * @returns {undefined} nothing
 */
  constructor(commandsArray, mainWindow) {
    this.commands = commandsArray;
    this.mainWindow = mainWindow;
    // app.on('will-finish-launching', () => {
    this.parseParams();
    // });
  }

  /**
 * We need to parse link params when it is time
 * @returns {undefined} nothing
 */
  parseParams() {
    const deepLinkSetParams = this.setParams.bind(this);

    if (process.platform === 'darwin') {
      app.on('open-url', (event, url) => {
        console.log('url mac:', url);
        event.preventDefault();
        deepLinkSetParams(url);

        if (this.getParams() && this.mainWindow.isVisible()) {
          this.mainWindow.webContents.send('deep-link', this.getParams());
        }
      });
    } else {
      deepLinkSetParams(process.argv.slice(1));

      const gotTheLock = app.requestSingleInstanceLock();

      if (gotTheLock) {
        app.on('second-instance', (e, argv) => {
          if (process.platform !== 'darwin') {
            deepLinkSetParams(argv.slice(1));
          }

          if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) {
              this.mainWindow.restore();
            };
            this.mainWindow.focus();
          }
          if (this.getParams() && this.mainWindow.isVisible()) {
            this.mainWindow.webContents.send('deep-link', this.getParams());
          }
        });
      } else {
        app.quit();
      }
    }
  }

  /**
 * Send deep link command to renderer process
 * @param {string} param deep link string
 * @returns {boolean} if deep link parsing is successful
 */
  setParams(param) {
    this.params = null;
    const commandObj = deepLinkDeconstruct(param.toString());

    console.log(commandObj);

    if (!this.commands.includes(commandObj.command)) {
      return false;
    }
    this.params = commandObj;

    return true;
  }

  /**
 * Get deep link params
 * @returns {Object} deep link params
 */
  getParams() {
    return this.params;
  }
}