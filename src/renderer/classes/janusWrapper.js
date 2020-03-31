import { EventEmitter } from 'events';
import Janus from './janus';

const ERROR_CODES = {
  SERVER_DOWN: 'Server is down',
  AUTHORIZATION_ERROR: 'Authorization error',
  UNKNOW: 'Unknow error',
};

/**
 * Wrapper for Janus connection
 * @class
 */
class JanusWrapper extends EventEmitter {
  /**
   * Creates an instance for Janus connection
   * @param {object} config Janus connection parameters
   * @param {string} config.janusServerUrl Url of Janus server
   * @param {string} config.janusAuthToken Authenticate token for Janus connection
   * @param {boolean} config.debug Enable or disable debug output
   */
  constructor({ janusServerUrl, janusAuthToken, debug }) {
    super();

    // Initialize private variables
    this.__janusServerUrl = janusServerUrl;
    this.__janusAuthToken = janusAuthToken;
    this.__janus = null;
    this.__debug = debug;
  }

  /**
   * Initialized janus library
   * It is needed to be called just after app started
   * @return {Promise<null>}
   */
  static init() {
    return new Promise((resolve) => {
      Janus.init({
        debug: true,
        dependencies: Janus.useDefaultDependencies(),
        callback: function () {
          resolve();
        },
      });
    });
  }

  /**
   * Connects to the Janus server
   * @returns {Promise<null>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      let isFullfilled = false;

      this.__janus = new Janus({
        server: this.__janusServerUrl,
        token: this.__janusAuthToken,
        success: () => {
          resolve();
          isFullfilled = true;
        },
        error: (cause) => {
          let internalError = '';

          if (cause.indexOf('Connect to Janus error') + 1 || cause.indexOf('Lost connection to the server') + 1) {
            internalError = ERROR_CODES.SERVER_DOWN;
          } else if (cause.indexOf('Unauthorized request') + 1) {
            internalError = ERROR_CODES.AUTHORIZATION_ERROR;
          } else {
            internalError = ERROR_CODES.UNKNOW;
          }

          this._debug('Janus connection error', cause);
          if (isFullfilled) {
            this.emit('connection-error', internalError);

            return;
          }
          reject(internalError);
          isFullfilled = true;
        },
        destroyed: () => {
          this.emit('destroyed');
        },
      });
    });
  }

  /**
   * Disconnect with server and close all active traffic channels
   * @returns {undefined}
   */
  disconnect() {
    if (!this.__janus) {
      return;
    }
    if (!this.__janus.isConnected()) {
      return;
    }
    this.__janus.destroy();
  }

  /**
   * Inner debug tool
   * @returns {undefined}
   */
  _debug() {
    if (this.__debug) {
      console.log('JANUS WRAPPER: ', ...arguments);
    }
  }
};

JanusWrapper.errors = ERROR_CODES;

export default JanusWrapper;