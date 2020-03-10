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
      hash: 'devMode 123',
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
 * @param {String} commandsArray legitimate commands
 * @returns {undefined} nothing
 */
  constructor(commandsArray) {
    this.commands = commandsArray;
    app.on('will-finish-launching', () => {
      this.parseParams();
    });
  }

  /**
 * We need to parse link params when it is time
 * @returns {undefined} nothing
 */
  parseParams() {
    if (process.platform === 'darwin') {
      app.on('open-url', function (event, url) {
        event.preventDefault();
        this.setDeepLinkParams(url);
      });
    } else {
      this.setDeepLinkParams(process.argv.slice(1));
    }
  }

  /**
 * Send deep link command to renderer process
 * @param {string} param deep link string
 * @returns {boolean} if deep link parsing is successful
 */
  setDeepLinkParams(param) {
    const commandObj = deepLinkDeconstruct(param);

    if (!this.commands.includes(commandObj.command)) {
      return false;
    }
    this.params = commandObj;

    return true;
  }
}

export default new DeepLinkMain(['invite', 'call', 'join']);