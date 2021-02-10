import { app, ipcMain } from 'electron';
import path from 'path';
import Conf from 'conf';

/**
 * Class for local storage
 */
class Store extends Conf {
  /**
 * Inits deep link class
 * @param {object} opt name for store and other stuff
 * @returns {void}
 */
  constructor(opt) {
    const defaultCwd = app.getPath('userData');

    opt = {
      name: 'config',
      ...opt,
    };

    if (opt.cwd) {
      opt.cwd = path.isAbsolute(opt.cwd) ? opt.cwd : path.join(defaultCwd, opt.cwd);
    } else {
      opt.cwd = defaultCwd;
    }

    opt.configName = opt.name;
    delete opt.name;
    super(opt);
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

// ----------//

const stores = {
  heykaStore,
  meStore,
  codeFileStore,
  authFileStore,
};

ipcMain.handle('localstore-get', async (event, options) => {
  if (!stores[options.store]) {
    return undefined;
  }

  return stores[options.store].get(options.key, options.defaultValue);
});

ipcMain.on('localstore-getSync', (event, options) => {
  if (!stores[options.store]) {
    event.returnValue = undefined;

    return;
  }
  event.returnValue = stores[options.store].get(options.key, options.defaultValue);
});

ipcMain.handle('localstore-has', async (event, options) => {
  if (!stores[options.store]) {
    return undefined;
  }
  if (stores[options.store].has(options.key)) {
    return true;
  }

  return false;
});

ipcMain.on('localstore-set', async (event, options) => {
  if (!stores[options.store]) {
    return;
  }
  stores[options.store].set(options.key, options.value);
});