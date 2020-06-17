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
const REQUEST_VIDEOSTREAM_TIMEOUT = 5000;
const DEFAULT_BITRATE_CAMERA_ = 256000;
const DEFAULT_BITRATE_SCREEN = 512000;

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
  localVideoStream: 'local-video-stream',
  successVideoPublishing: 'success-video-publishing',
  channelJoined: 'channel-joined',
  audioSlowLink: 'audio-slow-link',
  videoSlowLink: 'video-slow-link',
  webrtcCleanUp: 'webrtc-cleanup',
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
   * @param {string} config.microphoneDeviceId Device id of selected microphone
   * @param {boolean} config.debug Enable or disable debug output
   */
  constructor({
    janusServerUrl,
    janusAuthToken,
    channelAuthToken,
    audioRoomId,
    videoRoomId,
    userId,
    microphoneDeviceId,
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
    this.__microphoneDeviceId = microphoneDeviceId;
    this.__debug = debug;

    this.__janus = null;

    // plugins
    this.__audiobridgePlugin = null;
    this.__audiobridgeReady = false;
    this.__videoroomPlugin = null;
    this.__videoroomReady = false;

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
      microphoneDeviceId: this.__microphoneDeviceId,
      debug: this.__debug,
    });

    audiobridgePlugin.attach();

    audiobridgePlugin.on('remote-audio-stream', stream => this.emit(JANUS_WRAPPER_EVENTS.remoteAudioStream, stream));
    audiobridgePlugin.on('media-state', isActive => {
      this.emit(JANUS_WRAPPER_EVENTS.audioStreamActive, isActive);
      if (isActive) {
        this.__audiobridgeReady = true;
        // Сообщаем о том, что join к каналу успешно завершен
        // Если перед этим videoroom заджойнился к каналу
        if (this.__videoroomReady) {
          this.emit(JANUS_WRAPPER_EVENTS.channelJoined);
        }
      }
    });
    audiobridgePlugin.on('start-speaking', () => this.emit(JANUS_WRAPPER_EVENTS.speaking, true));
    audiobridgePlugin.on('stop-speaking', () => this.emit(JANUS_WRAPPER_EVENTS.speaking, false));
    audiobridgePlugin.on('volume-change', (db) => this.emit(JANUS_WRAPPER_EVENTS.volumeChange, db));
    audiobridgePlugin.on('audio-slow-link', (uplink) => this.emit(JANUS_WRAPPER_EVENTS.audioSlowLink, uplink));

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

    videoroomPlugin.on('active-publishers', publishers => {
      this.emit(JANUS_WRAPPER_EVENTS.videoPublishersList, publishers);
      this.__videoroomReady = true;
      // videoroom готов, сообщаем что присоединение к каналу завершено
      // если при этом audiobridge уже заджойнился
      if (this.__audiobridgeReady) {
        this.emit(JANUS_WRAPPER_EVENTS.channelJoined);
      }
    });
    videoroomPlugin.on('publisher-joined', publisher => this.emit(JANUS_WRAPPER_EVENTS.videoPublisherJoined, publisher));
    videoroomPlugin.on('publisher-left', publisher => this.emit(JANUS_WRAPPER_EVENTS.videoPublisherLeft, publisher));
    videoroomPlugin.on('local-video-stream', stream => this.emit(JANUS_WRAPPER_EVENTS.localVideoStream, stream));
    videoroomPlugin.on('success-publishing', () => this.emit(JANUS_WRAPPER_EVENTS.successVideoPublishing));
    videoroomPlugin.on('video-slow-link', () => this.emit(JANUS_WRAPPER_EVENTS.videoSlowLink));
    videoroomPlugin.on('webrtc-cleanup', () => this.emit(JANUS_WRAPPER_EVENTS.webrtcCleanUp));

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
   * Set new microphone source
   * @param {string} deviceId Device id
   * @returns {void}
   */
  setMicrophoneDevice(deviceId) {
    if (this.__audiobridgePlugin) {
      this.__audiobridgePlugin.setMicrophoneDevice(deviceId);
    }
  }

  /**
   * Set new camera source
   * @param {string} deviceId Device id
   * @returns {void}
   */
  async setCameraDevice(deviceId) {
    if (this.__videoroomPlugin) {
      const stream = await mediaCapturer.getCameraStream(deviceId);

      this.__videoroomPlugin.replaceStream(stream);
    }
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

    this.__videoroomPlugin.publishVideo(stream, type === 'camera' ? DEFAULT_BITRATE_CAMERA_ : DEFAULT_BITRATE_SCREEN);
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

    console.log(`%c videoroomPlugins ADDED ${Object.keys(this.__videoroomPlugins).length}`, 'background: red; color: white;', this.__videoroomPlugins);
    let requestTimeout;
    const prom = new Promise((resolve, reject) => {
      requestTimeout = setTimeout(() => {
        console.error('REQUEST_VIDEOSTREAM_TIMEOUT');
      }, REQUEST_VIDEOSTREAM_TIMEOUT);
      plugin.once('remote-video-stream', stream => {
        clearTimeout(requestTimeout);
        resolve(stream);
      });
    });

    plugin.attach();

    return prom;
  }

  /**
   * Stops receiving video stream from given publisher
   * @param {string} janusId Janus user id
   * @returns {void}
   */
  async stopReceivingVideoStream(janusId) {
    if (!this.__videoroomPlugins[janusId]) {
      return;
    }

    this.__videoroomPlugins[janusId].detach();

    delete this.__videoroomPlugins[janusId];

    console.log(`%c videoroomPlugins REMOVED ${Object.keys(this.__videoroomPlugins).length}`, 'background: red; color: white;', this.__videoroomPlugins);
  }

  /**
   * Connects to the Janus server
   * @private
   * @returns {Promise<null>}
   */
  _connect() {
    return new Promise((resolve, reject) => {
      let isFullfilled = false;

      // convert url to websocket connect
      // url is like "http://janus-host.domen.zone:8088/janus";
      let wsurl = '';

      if (this.__url.indexOf('http') + 1) {
        wsurl = this.__url.replace('http', 'ws')
          .replace('8088', '8188')
          .replace('/janus', '');
      } else {
        wsurl = this.__url.replace('https', 'wss')
          .replace('8089', '8189')
          .replace('/janus', '');
      }
      this._debug(`Connect to janus. rest-api: ${this.__url}, ws-api: ${wsurl}`);

      this.__janus = new Janus({
        server: [wsurl, this.__url],
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
    Object.keys(this.__videoroomPlugins).forEach(key => {
      this.__videoroomPlugins[key].detach();
      delete this.__videoroomPlugins[key];
    });
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
