import { EventEmitter } from 'events';
import Janus from './janus';
import AudiobridgePlugin from './AudiobridgePlugin';
// eslint-disable-next-line no-unused-vars
import adapter from 'webrtc-adapter';

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
    janusServerUrl,
    janusAuthToken,
    channelAuthToken,
    audioRoomId,
    videoRoomId,
    userId,
    debug,
  }) {
    super();

    // Initialize private variables
    this.__url = janusServerUrl + ':8088/janus';
    this.__workspaceToken = janusAuthToken;
    this.__channelToken = channelAuthToken;
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
    return new Promise((resolve, reject) => {
      if (!Janus.isWebrtcSupported()) {
        reject(new Error('WebRTC is not supported'));
      }
      Janus.init({
        debug: this.__debug,
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
    await this._connect();

    const audiobridgePlugin = new AudiobridgePlugin({
      janus: this.__janus,
      room: this.__audioRoomId,
      token: this.__channelToken,
      userId: this.__userId,
      debug: this.__debug,
    });

    audiobridgePlugin.attach();

    audiobridgePlugin.on('remote-audio-stream', stream => this.emit('remote-audio-stream', stream));
    audiobridgePlugin.on('media-state', isActive => this.emit('audio-stream-active', isActive));
    audiobridgePlugin.on('start-speaking', () => this.emit('speaking', true));
    audiobridgePlugin.on('stop-speaking', () => this.emit('speaking', false));

    this.__audiobridgePlugin = audiobridgePlugin;
  }

  /**
   * Mute/unmute current user
   * @param {boolean} muted Should the user be muted
   * @returns {undefined}
   */
  setMuting(muted) {
    this.__audiobridgePlugin.setMuting(muted);
  }

  /**
   * Connects to the Janus server
   * @private
   * @returns {Promise<null>}
   */
  _connect() {
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
   * @private
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
   * @private
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