import router from '@/router';

/**
 * A class that handles Deep Links in renderer process
 */
class DeepLinkRenderer {
  /**
 * Inits deep link class
 * @param {String} map command-router mapping
 * @returns {undefined} nothing
 */
  constructor(map) {
    this.commandMap = map;
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

export default new DeepLinkRenderer({
  login: 'login',
  join: 'main',
  call: 'main',
  d: 'main',
});