import { EventEmitter } from 'events';
import Janus from './janus';
import PublishingVideoroomPlugin from './PublishingVideoroomPlugin';
import SubscribingVideoroomPlugin from './SubscribingVideoroomPlugin';
import TextroomPlugin from './TextroomPlugin';
import mediaCapturer from '@classes/mediaCapturer';

/** @type {number} How much time I should wait for 'webrtc-cleanup' event before throw an error */
const WAIT_UNTIL_UNPUBLISH_TIMEOUT = 1000;

const ERROR_CODES = {
  SERVER_DOWN: 'Server is down',
  AUTHENTICATION_ERROR: 'Authentication error',
  UNKNOW: 'Unknow error',
};

/**
 * @typedef JanusOptions
 * @property {string} options.janusServerUrl Janus server url
 * @property {string} options.janusWsServerUrl Janus websocket server url
 * @property {string} options.janusAuthToken Janus auth token
 * @property {string} options.channelAuthToken Auth token for Janus channel
 * @property {number} options.videoRoomId Id of video room
 * @property {string} options.userId Heyka backend user id
 */

/**
 * @typedef {object} Publisher
 * @property {string} userId Heyka backend user id
 * @property {number} janusId Janus publisher id (feed)
 * @property {SubscribingVideoroomPlugin} plugin Plugin for subscribing
 * @property {MediaStream} stream Video stream of that publisher
 * @property {boolean} paused Is video paused
 */

/**
 * Manage Janus connection for subscribing and publishing video
 * @class
 */
class JanusVideoroomWrapper extends EventEmitter {
  /**
   * Class constructor
   * @constructor
   */
  constructor() {
    super();

    /** @type {Janus} JanusInstance */
    this.__janus = null;

    /** @type {JanusOptions} Current janus options */
    this.__janusOptions = {
      janusAuthToken: null,
      janusServerUrl: null,
      janusWsServerUrl: null,
      channelAuthToken: null,
      videoRoomId: null,
      userId: null,
    };

    /** @type {PublishingVideoroomPlugin} Plugin for publishing and watching for others */
    this.__videoroomPlugin = null;
    /** @type {MediaStream} Local video stream if publising */
    this.__localVideoStream = null;

    /** @type {Array<Publisher>} PublisherList */
    this.__publishers = [];

    /** @type {SubscribingVideoroomPlugin} SingleSubscriber */
    this.__singleSubscriber = null;
    /** @type {MediaStream} Stream of single subscription */
    this.__singleRemoteStream = null;
    /** @type {number} Feed of janus for single subscription*/
    this.__singleFeed = null;

    /** @type {TextroomPlugin} Textroom plugin handler */
    this.__textroomPlugin = null;
  }

  /**
   * Initialized janus library
   * It is needed to be called just after app started
   * @static
   * @return {void}
   */
  init() {
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
   * Connect to the Janus and join the room
   * @param {string} userId Heyka user id
   * @param {JanusOptions} options Connection options
   * @returns {void}
   */
  async join(userId, options) {
    /** Connect to Janus */
    if (!this.__janus) {
      await this._connect(options.janusServerUrl, options.janusWsServerUrl, options.janusAuthToken);
    }

    // If channel if changed, leave previous channel first
    if (this.__janusOptions.videoRoomId && this.__janusOptions.videoRoomId !== options.videoRoomId) {
      await this.leave();
    }

    // If trying to connect the same channel do nothing
    if (this.__janusOptions.videoRoomId && this.__janusOptions.videoRoomId === options.videoRoomId) {
      return;
    }

    // save janus options
    this.__janusOptions = { ...options };

    // connect videoroom plugin
    const videoroomPlugin = new PublishingVideoroomPlugin({
      janus: this.__janus,
      room: options.videoRoomId,
      token: options.channelAuthToken,
      userId,
      debug: true,
    });

    videoroomPlugin.attach();

    videoroomPlugin.on('active-publishers', this._onPublisherList.bind(this));
    videoroomPlugin.on('publisher-joined', this._onPublisherJoined.bind(this));
    videoroomPlugin.on('publisher-left', this._onPublisherLeft.bind(this));

    this.__videoroomPlugin = videoroomPlugin;
  }

  /**
   * Leave current room and detach all plugins
   * @returns {Promise<null>}
   */
  leave() {
    if (!this.__videoroomPlugin) {
      return;
    }

    this.__videoroomPlugin.removeAllListeners('active-publishers');
    this.__videoroomPlugin.removeAllListeners('publisher-joined');
    this.__videoroomPlugin.removeAllListeners('publisher-left');

    this.__publishers.forEach(publisherObject => {
      if (publisherObject.plugin) {
        publisherObject.plugin.removeAllListeners('remote-video-stream');
        publisherObject.plugin.detach();
        publisherObject.plugin = null;
      }
      if (publisherObject.stream) {
        mediaCapturer.destroyStream(publisherObject.stream);
        publisherObject.stream = null;
      }
      publisherObject.userId = null;
      publisherObject.janusId = null;
      publisherObject.paused = null;
      publisherObject = null;
    });
    this.__publishers.splice(0, this.__publishers.length);

    if (this.__singleSubscriber) {
      this.removeSingleSubscription();
    }

    return new Promise((resolve, reject) => {
      if (this.__videoroomPlugin && this.__localVideoStream) {
        // wait for reject
        let rejectTimeout = setTimeout(() => {
          reject(new Error('CantUnpublish'));
        }, WAIT_UNTIL_UNPUBLISH_TIMEOUT);

        // wait for success resolving
        this.__videoroomPlugin.once('webrtc-cleanup', () => {
          clearTimeout(rejectTimeout);
          rejectTimeout = null;
          resolve();
        });

        // send command for unpublish
        this.__videoroomPlugin.unpublishVideo();

        // destroy stream
        mediaCapturer.destroyStream(this.__localVideoStream);

        this.__videoroomPlugin.detach();
        this._disconnect();
      } else {
        this.__videoroomPlugin.detach();
        this._disconnect();
        resolve();
      }
      this.__localVideoStream = null;
      this.__videoroomPlugin = null;
      this.__janusOptions = {};
    });
  }

  /**
   * Subscribe for specific publisher
   * @param {number} janusId Janus publisher id (feed)
   * @return {MediaStream}
   */
  subscribeFor(janusId) {
    const publisherObject = this.__publishers.find(el => el.janusId === janusId);

    if (!publisherObject) {
      throw new Error('PublisherNotFound');
    }

    if (publisherObject.plugin) {
      throw new Error('AlreadySubscribed');
    }

    const plugin = new SubscribingVideoroomPlugin({
      janus: this.__janus,
      room: this.__janusOptions.videoRoomId,
      token: this.__janusOptions.channelAuthToken,
      userId: publisherObject.userId,
      janusId,
      debug: true,
    });

    plugin.attach();

    plugin.on('remote-video-stream', stream => {
      publisherObject.paused = false;
      this._onRemoteStream(janusId, stream);
    });

    publisherObject.plugin = plugin;
  }

  /**
   * Set the publisher video on pause
   * @param {number} janusId Janus publisher id (feed)
   * @returns {void}
   */
  pauseSubscription(janusId) {
    const publisherObject = this.__publishers.find(el => el.janusId === janusId);

    if (!publisherObject) {
      throw new Error('PublisherNotFound');
    }

    if (!publisherObject.plugin) {
      throw new Error('PluginNotAttached');
    }

    publisherObject.plugin.pause();
    publisherObject.paused = true;
  }

  /**
   * Resume publisher video stream
   * @param {number} janusId Janus publisher id (feed)
   * @returns {void}
   */
  resumeSubscription(janusId) {
    const publisherObject = this.__publishers.find(el => el.janusId === janusId);

    if (!publisherObject) {
      throw new Error('PublisherNotFound');
    }

    if (!publisherObject.plugin) {
      throw new Error('PluginNotAttached');
    }

    publisherObject.plugin.resume();
    publisherObject.paused = false;
  }

  /**
   * Return all streams that are active
   *
   * @typedef {object} ActivePublishers
   * @property {MediaStream} stream active stream
   * @property {string} userId heyka user id
   * @property {number} janusId janus user id (feed)
   *
   * @returns {Array<ActivePublishers>} Array of active streams
   */
  getActivePublishers() {
    return this.__publishers
      .map(publisher => ({
        stream: publisher.stream,
        userId: publisher.userId,
        janusId: publisher.janusId,
      }));
  }

  /**
   * Unpause all subscriptions that are in pause
   * @returns {void}
   */
  resumeAllSubscriptions() {
    this.__publishers.forEach(publisher => {
      if (publisher.plugin && publisher.paused) {
        this.resumeSubscription(publisher.janusId);
      }
    });
  }

  /**
   * Create plugin for single subscription
   * @param {number} janusId Janus user id (feed)
   * @returns {void}
   */
  createSingleSubscription(janusId) {
    if (!this.__janus) {
      return;
    }

    if (this.__singleFeed) {
      if (this.__singleFeed !== janusId) {
        this.switchSingleSubscription(janusId);
      }

      if (this.__singleFeed === janusId && this.__singleRemoteStream) {
        this.emit('single-sub-stream', this.__singleRemoteStream);
      }
    }

    const plugin = new SubscribingVideoroomPlugin({
      janus: this.__janus,
      room: this.__janusOptions.videoRoomId,
      token: this.__janusOptions.channelAuthToken,
      userId: this.__janusOptions.userId,
      janusId,
      debug: true,
    });

    plugin.attach();

    plugin.on('remote-video-stream', (stream) => {
      this.emit('single-sub-stream', stream);
    });
    plugin.on('switched', () => this.emit('switched'));
    plugin.on('started', () => this.emit('started'));
    plugin.on('paused', () => this.emit('paused'));

    plugin.on('webrtc-cleanup', () => {
      this.__singleFeed = null;
      this.emit('cleanup');
    });

    this.__singleSubscriber = plugin;
    this.__singleFeed = janusId;
  }

  /**
   * Switch single subscription for another janus feed
   * @param {number} janusId Janus id (feed)
   * @returns {void}
   */
  switchSingleSubscription(janusId) {
    if (!this.__singleSubscriber) {
      return;
    }

    this.__singleFeed = janusId;

    this.__singleSubscriber.switch(janusId);
  }

  /**
   * Get current feed for single subscription
   * @returns {number} Janus feed
   */
  currentSingleSubscriptionFeed() {
    return this.__singleFeed;
  }

  /**
   * Remove subscription plugin for single feed
   * @returns {void}
   */
  removeSingleSubscription() {
    this.__singleSubscriber.removeAllListeners('remote-video-stream');
    this.__singleSubscriber.removeAllListeners('switched');
    this.__singleSubscriber.removeAllListeners('paused');
    this.__singleSubscriber.removeAllListeners('started');
    this.__singleSubscriber.removeAllListeners('webrtc-cleanup');
    if (this.__singleSubscriber) {
      this.__singleSubscriber.detach();
      this.__singleSubscriber = null;
    }
    if (this.__singleRemoteStream) {
      mediaCapturer.destroyStream(this.__singleRemoteStream);
      this.__singleRemoteStream = null;
    }
    this.__singleFeed = null;
  }

  /**
   * Connects to the textroom plugin
   * Connects to the janus if connection doesnt exist
   * @param {string} userId User id
   * @param {string} participantType "Sender" or "receiver"
   * @param {?JanusOptions} options Janus options
   * @returns {void}
   */
  async connectTextroom(userId, participantType, options) {
    if (!this.__janus) {
      await this._connect(options.janusServerUrl, options.janusAuthToken);
      this.__janusOptions = {
        ...options,
      };
    }

    if (this.__textroomPlugin) {
      this.disconnectTextroom();
    }

    this.__textroomPlugin = new TextroomPlugin({
      janus: this.__janus,
      room: this.__janusOptions.videoRoomId,
      token: this.__janusOptions.channelAuthToken,
      userId: `${userId}(${participantType})`,
    });

    this.__textroomPlugin.on('data', (data) => {
      this.emit('textroom-data', data);
    });

    this.__textroomPlugin.on('join', (username) => {
      this.emit('textroom-joined', username);
    });

    this.__textroomPlugin.attach();
  }

  /**
   * Send message to textroom via DataChannel
   * @param {object} data Any JSON object
   * @param {string?} userId Send data to a particular user
   * @returns {void}
   */
  async sendData(data, userId) {
    if (!this.__textroomPlugin) {
      return;
    }
    if (userId.indexOf('(') !== -1) {
      this.__textroomPlugin.sendData(data, userId);
    } else {
      this.__textroomPlugin.sendData(data, `${userId}(receiver)`);
    }
  }

  /**
   * Disconnects textroom from the channel
   * @returns {void}
   */
  disconnectTextroom() {
    if (!this.__textroomPlugin) {
      return;
    }

    this.__textroomPlugin.removeAllListeners('data');
    this.__textroomPlugin.removeAllListeners('joined');

    this.__textroomPlugin.detach();
    this.__textroomPlugin = null;
  }

  /**
   * Handles video publisher list
   * @private
   * @param {Array<object>} publishers Publisher list
   * @returns {void}
   */
  _onPublisherList(publishers) {
    if (publishers.length) {
      publishers.forEach(this._onPublisherJoined.bind(this));
    }
    this.emit('joined');
  }

  /**
   * Handles new publisher joined room
   * @private
   * @param {object} publisher Publisher object
   * @param {string} publisher.display Display name (Heyka user id)
   * @param {number} publisher.id Janus publisher id
   * @returns {void}
   */
  _onPublisherJoined(publisher) {
    const publisherObject = {
      userId: publisher.display,
      janusId: publisher.id,
      plugin: null,
      stream: null,
      stopped: null,
    };

    this.__publishers.push(publisherObject);

    this.emit('publisher-joined', {
      userId: publisherObject.userId,
      janusId: publisherObject.janusId,
    });
  }

  /**
   * Handles a publisher left the room
   * @private
   * @param {object} publisher Publisher left
   * @param {number} publisher.unpublished Janus publisher id
   * @returns {void}
   */
  _onPublisherLeft(publisher) {
    const index = this.__publishers.findIndex(el => el.janusId === publisher.unpublished);

    if (index > -1) {
      const publisherObject = this.__publishers[index];

      if (publisherObject.plugin) {
        publisherObject.plugin.detach();
        publisherObject.plugin = null;
      }
      if (publisherObject.stream) {
        mediaCapturer.destroyStream(publisherObject.stream);
        publisherObject.stream = null;
      }

      this.__publishers.splice(index, 1);

      this.emit('publisher-left', publisherObject.userId);
    }
  }

  /**
   * Handles local video stream
   * @param {MediaStream} stream Local video stream
   * @returns {void}
   */
  _onLocalStream(stream) {
    this.__localVideoStream = stream;
    this.emit('local-video-stream', stream);
  }

  /**
   * Handles remote video stream from a publisher
   * @param {number} janusId Janus publisher id (feed)
   * @param {MediaStream} stream Media stream
   * @returns {void}
   */
  _onRemoteStream(janusId, stream) {
    const publisherObject = this.__publishers.find(el => el.janusId === janusId);

    if (!publisherObject) {
      return;
    }

    publisherObject.stream = stream;

    this.emit('new-stream', {
      janusId,
      userId: publisherObject.userId,
      stream,
    });
  }

  /**
   * Connects to the Janus server
   * @private
   * @param {string} janusServerUrl janus server url
   * @param {string} janusWsServerUrl janus websocket server url
   * @param {string} janusAuthToken janus auth token
   * @returns {Promise<null>}
   */
  _connect(janusServerUrl, janusWsServerUrl, janusAuthToken) {
    return new Promise((resolve, reject) => {
      let isFullfilled = false;

      console.log(`Connect to janus. rest-api: ${janusServerUrl}, ws-api: ${janusWsServerUrl}`);

      this.__janus = new Janus({
        server: [janusWsServerUrl, janusServerUrl],
        token: janusAuthToken,
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

          console.error('Janus connection error', cause);
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
   * Disconnects from the Janus server
   * @private
   * @returns {void}
   */
  async _disconnect() {
    if (this.__janus) {
      this.__janus.destroy();
      this.__janus = null;
    }
  }
}

export default new JanusVideoroomWrapper();
