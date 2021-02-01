import { app } from 'electron';
const path = require('path');
const Conf = require('conf');

/**
 * Class for local storage
 */
class Store extends Conf {
  /**
 * Inits deep link class
 * @param {object} options name for store and other stuff
 * @returns {void}
 */
  constructor(options) {
    const defaultCwd = app.getPath('userData');

    options = {
      name: 'config',
      ...options,
    };

    if (options.cwd) {
      options.cwd = path.isAbsolute(options.cwd) ? options.cwd : path.join(defaultCwd, options.cwd);
    } else {
      options.cwd = defaultCwd;
    }

    options.configName = options.name;
    delete options.name;
    super(options);
  }
}

/* Stores that are used in our app */

export const heykaStore = new Store({
  name: 'app',
});

export const meStore = new Store({
  name: 'store-module-me',
});

export const codeFileStore = new Store({
  name: 'signin-code',
  encryptionKey: '1234543',
});

export const authFileStore = new Store({
  name: 'auth',
  encryptionKey: '1234543',
});