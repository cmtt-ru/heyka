import { EventEmitter } from 'events';
import Janus from './janus';
import AudiobridgePlugin from './AudiobridgePlugin';

const ERROR_CODES = {
  SERVER_DOWN: 'Server is down',
  AUTHENTICATION_ERROR: 'Authentication error',
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
   * @param {string} config.url Url of Janus server
   * @param {string} config.workspaceToken Authentication token for Janus connection
   * @param {string} config.channelToken Authentication token for channels
   * @param {number} config.audioRoomId Janus audio room id
   * @param {number} config.videoRoomId Janus video room id
   * @param {string} config.userId Application user id
   * @param {boolean} config.debug Enable or disable debug output
   */
  constructor({
    url,
    workspaceToken,
    channelToken,
    audioRoomId,
    videoRoomId,
    userId,
    debug,
  }) {
    super();

    // Initialize private variables
    this.__url = url;
    this.__workspaceToken = workspaceToken;
    this.__channelToken = channelToken;
    this.__audioRoomId = audioRoomId;
    this.__videoRoomId = videoRoomId;
    this.__userId = userId;
    this.__debug = debug;

    this.__janus = null;

    // plugins
    this.__audiobridgePlugin = null;
    this.__videoroomPlugin = null;
  }

  /**
   * Initialized janus library
   * It is needed to be called just after app started
   * @static
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
   * Attaches media stream to an HTML5 audio element
   * @static
   * @param {object} element HTML element
   * @param {object} stream Media stream
   * @return {undefined}
   */
  static attachMediaStream(element, stream) {
    Janus.attachMediaStream(element, stream);
  }

  /**
   * Connects to the server and join to channels
   * @public
   * @returns {Promise<Stream>} Audio stream from Janus server
   */
  async join() {
    /** Connect to Janus */
    await this.__connect();

    const audiobridgePlugin = new AudiobridgePlugin({
      janus: this.__janus,
      room: this.__audioRoomId,
      token: this.__channelToken,
      userId: this.__userId,
      debug: true,
    });

    audiobridgePlugin.attach();

    audiobridgePlugin.on('remote-audio-stream', stream => this.emit('remote-audio-stream', stream));
  }

  /**
   * Connects to the Janus server
   * @private
   * @returns {Promise<null>}
   */
  __connect() {
    return new Promise((resolve, reject) => {
      let isFullfilled = false;

      this.__janus = new Janus({
        server: this.__url,
        token: this.__workspaceToken,
        success: () => {
          resolve();
          isFullfilled = true;
        },
        error: (cause) => {
          let internalError = '';

          if (cause.indexOf('Connect to Janus error') + 1 || cause.indexOf('Lost connection to the server') + 1) {
            internalError = ERROR_CODES.SERVER_DOWN;
          } else if (cause.indexOf('Unauthorized request') + 1) {
            internalError = ERROR_CODES.AUTHENTICATION_ERROR;
          } else {
            internalError = ERROR_CODES.UNKNOW;
          }

          this.__debug('Janus connection error', cause);
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
   * @private
   * @returns {undefined}
   */
  __disconnect() {
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
   * @private
   * @returns {undefined}
   */
  __debug() {
    if (this.__debug) {
      console.log('JANUS WRAPPER: ', ...arguments);
    }
  }
};

JanusWrapper.errors = ERROR_CODES;

export default JanusWrapper;