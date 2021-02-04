/* eslint-disable require-jsdoc */
/**
 * Class for local storage
 */
class Store {
  /**
   * Inits deep link class
   * @param {string} name name for store
   * @returns {void}
   */
  constructor(name) {
    this.name = name;
  }

  get(key, defaultValue) {
    return window.ipcRenderer.invoke('localstore-get', {
      store: this.name,
      key,
      defaultValue,
    });
  }

  getSync(key, defaultValue) {
    return window.ipcRenderer.sendSync('localstore-getSync', {
      store: this.name,
      key,
      defaultValue,
    });
  }

  set(key, value) {
    window.ipcRenderer.send('localstore-set', {
      store: this.name,
      key,
      value,
    });
  }

  has(key) {
    return window.ipcRenderer.invoke('localstore-has', {
      store: this.name,
      key,
    });
  }
}

/* Stores that are used in our app */

export const heykaStore = new Store('heykaStore');

export const meStore = new Store('meStore');

export const codeFileStore = new Store('codeFileStore');

export const authFileStore = new Store('authFileStore');