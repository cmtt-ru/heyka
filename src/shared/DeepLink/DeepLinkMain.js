import { app } from 'electron';
import { IS_MAC } from '../../shared/Constants';

/**
 * Transforms deep link string to command with hash
 * @param {string} str deep link string
 * @returns {object} object with command and hash
 */
function deepLinkDeconstruct(str) {
  if (str.indexOf('://') === -1) { // test deeplink
    return {
      // command: 'join',
      // hash: 'devMode 12357858',
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
class DeepLinkMain {
  /**
 * Inits deep link class
 * @param {array} commandsArray legitimate commands
 * @param {object} mainWindow mainWindow instance
 * @returns {undefined} nothing
 */
  constructor(commandsArray) {
    this.commands = commandsArray;
    this.mainWindow = null;
    app.on('will-finish-launching', () => {
      this.parseParams();
    });
  }

  /**
 * We need to parse link params when it is time
 * @returns {undefined} nothing
 */
  parseParams() {
    const deepLinkSetParams = this.setParams.bind(this);

    if (IS_MAC) {
      // deepLinkSetParams('heyka://call/test/123');
      app.on('open-url', (event, url) => {
        console.log('url mac:', url);
        event.preventDefault();
        deepLinkSetParams(url);

        this.sendDeepLink();
      });
    } else {
      deepLinkSetParams(process.argv.slice(1));

      const gotTheLock = app.requestSingleInstanceLock();

      if (gotTheLock) {
        app.on('second-instance', (e, argv) => {
          deepLinkSetParams(argv.slice(1));
          console.log(argv);

          if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) {
              this.mainWindow.restore();
            }
            this.mainWindow.focus();
          }
          this.sendDeepLink();
        });
      } else {
        app.quit();
      }
    }
  }

  /**
 * Try sending deep link command to renderer process
 * @returns {undefined} nothing
 */
  sendDeepLink() {
    if (this.getParams() && this.mainWindow && this.mainWindow.isVisible()) {
      this.mainWindow.webContents.send('deep-link', this.getParams());
    }
  }

  /**
 * Set deep link parameters
 * @param {string} param deep link string
 * @returns {boolean} if deep link parsing is successful
 */
  setParams(param) {
    this.params = null;
    const commandObj = deepLinkDeconstruct(param.toString());

    if (!this.commands.includes(commandObj.command)) {
      return false;
    }
    this.params = commandObj;

    return true;
  }

  /**
 * add mainWindow instance to deepLink object
 * @param {string} window mainWindow instance
 * @returns {undefined} NOTHING
 */
  bindMainWindow(window) {
    this.mainWindow = window;
  }

  /**
 * Get deep link params
 * @returns {object} deep link params
 */
  getParams() {
    return this.params;
  }
}

export default new DeepLinkMain(['invite', 'call', 'join', 'login']);
