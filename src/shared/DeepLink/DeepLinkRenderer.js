import { EventEmitter } from 'events';

/**
 * A class that handles Deep Links in renderer process
 */
class DeepLinkRenderer extends EventEmitter {
  /**
   * Deep link class
   * @returns {void}
   */
  constructor() {
    super();
    window.ipcRenderer.on('deep-link', (event, args) => {
      this.deepLinkHandler(args);
    });
  }

  /**
   * Deep link handler
   * @param {object} data – object with command and paths
   * @returns {void}
   */
  deepLinkHandler(data) {
    this.emit('new-link', data);
    this.emit(data.command, data.paths);
  }
}

export default new DeepLinkRenderer();
