import { EventEmitter } from 'events';
import Janus from './janus';
import AudiobridgePlugin from './AudiobridgePlugin';
import PublishingVideoroomPlugin from './PublishingVideoroomPlugin';
import SubscribingVideoroomPlugin from './SubscribingVideoroomPlugin';
import mediaCapturer from './mediaCapturer';
// eslint-disable-next-line no-unused-vars
import adapter from 'webrtc-adapter';

const ERROR_CODES = {
  SERVER_DOWN: 'Server is down',
  AUTHENTICATION_ERROR: 'Authentication error',
  UNKNOW: 'Unknow error',
};

// Possible events for subscribing
const JANUS_WRAPPER_EVENTS = {
  connectionError: 'connection-error',
  remoteAudioStream: 'remote-audio-stream',
  audioStreamActive: 'audio-stream-active',
  speaking: 'speaking',
  volumeChange: 'volume-change',
  videoPublishersList: 'video-publishers-list',
  videoPublisherJoined: 'video-publisher-joined',
  videoPublisherLeft: 'video-publisher-left',
  remoteVideoStream: 'remote-video-stream',
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

    // plugins for specific video publishers
    this.__videoroomPlugins = {};
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

    // connect audiobridge plugin

    const audiobridgePlugin = new AudiobridgePlugin({
      janus: this.__janus,
      room: this.__audioRoomId,
      token: this.__channelToken,
      userId: this.__userId,
      debug: this.__debug,
    });

    audiobridgePlugin.attach();

    audiobridgePlugin.on('remote-audio-stream', stream => this.emit(JANUS_WRAPPER_EVENTS.remoteAudioStream, stream));
    audiobridgePlugin.on('media-state', isActive => this.emit(JANUS_WRAPPER_EVENTS.audioStreamActive, isActive));
    audiobridgePlugin.on('start-speaking', () => this.emit(JANUS_WRAPPER_EVENTS.speaking, true));
    audiobridgePlugin.on('stop-speaking', () => this.emit(JANUS_WRAPPER_EVENTS.speaking, false));
    audiobridgePlugin.on('volume-change', (db) => this.emit(JANUS_WRAPPER_EVENTS.volumeChange, db));

    this.__audiobridgePlugin = audiobridgePlugin;

    // connect videoroom plugin
    const videoroomPlugin = new PublishingVideoroomPlugin({
      janus: this.__janus,
      room: this.__videoRoomId,
      token: this.__channelToken,
      userId: this.__userId,
      debug: this.__debug,
    });

    videoroomPlugin.attach();

    videoroomPlugin.on('active-publishers', publishers => this.emit(JANUS_WRAPPER_EVENTS.videoPublishersList, publishers));
    videoroomPlugin.on('publisher-joined', publisher => this.emit(JANUS_WRAPPER_EVENTS.videoPublisherJoined, publisher));
    videoroomPlugin.on('publisher-left', publisher => this.emit(JANUS_WRAPPER_EVENTS.videoPublisherLeft, publisher));
    videoroomPlugin.on('remote-video-stream', data => this.emit(JANUS_WRAPPER_EVENTS.remoteVideoStream, data));

    this.__videoroomPlugin = videoroomPlugin;
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
   * Publish video stream
   * @param {string} type "camera" or "screen"
   * @param {string} source Source id (camera device id or screen source id)
   * @returns {void}
   */
  async publishVideoStream(type = 'camera', source) {
    let stream = null;

    this._debug('Start sharing video', type, source);

    if (type === 'camera') {
      stream = await mediaCapturer.getCameraStream(source);
    } else {
      stream = await mediaCapturer.getStream(source);
    }

    this.__videoroomPlugin.publishVideo(stream);
  }

  /**
   * Unpublish video stream
   * @returns {void}
   */
  unpublishVideoStream() {
    this.__videoroomPlugin.unpublishVideo();
  }

  /**
   * Request video stream for given publisher
   * @param {string} janusId Janus user id subscribe for
   * @returns {Promise<MediaStream>} Return media stream
   */
  async requestVideoStream(janusId) {
    const plugin = new SubscribingVideoroomPlugin({
      janus: this.__janus,
      userId: this.__userId,
      room: this.__videoRoomId,
      janusId,
      debug: this.__debug,
      token: this.__channelToken,
    });

    this.__videoroomPlugins[janusId] = plugin;

    return new Promise((resolve) => {
      plugin.on('remote-video-stream', stream => {
        resolve(stream);
      });
    });
  }

  /**
   * Stops receiving video stream from giben publisher
   * @param {string} janusId Janus user id
   * @returns {void}
   */
  async stopReceivingVideoStream(janusId) {
    if (!this.__videoroomPlugins[janusId]) {
      return;
    }

    this.__videoroomPlugins[janusId].detach();
    delete this.__videoroomPlugins[janusId];
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
    if (this.__audiobridgePlugin) {
      this.__audiobridgePlugin.detach();
      this.__audiobridgePlugin = null;
    }
    if (this.__videoroomPlugin) {
      this.__videoroomPlugin.detach();
      this.__videoroomPlugin = null;
    }
    this.__janus.destroy();
    this.__janus = null;
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
JanusWrapper.events = JANUS_WRAPPER_EVENTS;

export default JanusWrapper;