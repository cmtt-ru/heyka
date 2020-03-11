import router from '@/router';
import { ipcRenderer } from 'electron';

/**
 * A class that handles Deep Links in renderer process
 */
export default class DeepLinkRenderer {
  /**
 * Inits deep link class
 * @param {String} map command-router mapping
 * @returns {undefined} nothing
 */
  constructor(map) {
    this.commandMap = map;
    ipcRenderer.on('deep-link', (event, args) => {
      this.route(args);
    });
  }

  /**
 * Route to correct page with correct params
 * @param {Object} params object with command and hash
 * @returns {boolean} valid or invalid route
 */
  route(params) {
    if (this.commandMap[params.command]) {
      router.replace({
        path: this.commandMap[params.command],
        query: { hash: params.hash },
      });
    }
  }
}

// export default new DeepLinkRenderer({
// login: 'login',
// join: 'main/workspace',
// call: 'main/workspace',
// d: 'main/workspace',
// });