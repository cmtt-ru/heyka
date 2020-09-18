import { EventEmitter } from 'events';
import mediaCapturer from '@classes/mediaCapturer';
import Logger from '@sdk/classes/logger';
const cnsl = new Logger('Publ Videoroom', '#1990bf');
const JANUS_PLUGIN = 'janus.plugin.videoroom';
const WAITING_UNPUBLISH_TIMEOUT = 2000;
/* eslint-disable */

/**
 * Handle communication with videoroom plugin for publishing
 * @class
 */
class PublishingVideoroomPlugin extends EventEmitter {
  /**
   * Creates an instance of videoroom plugin class
   * @param {object} options videoroom plugin config
   * @param {object} options.janus An active Janus connection
   * @param {number} options.room Room in videoroom plugin
   * @param {string} options.token Authentication token for room
   * @param {string} options.userId Connected user id
   */
  constructor(options) {
    super();

    const {
      janus,
      room,
      token,
      userId,
    } = options;

    this.__janus = janus;
    this.__room = room;
    this.__token = token;
    this.__userId = userId;

    this.__localVideoStream = null;
    this.__detached = false;
    this.__pluginHandle = null;
  }

  /**
   * Attaches videoroom plugin and join room
   * @returns {void}
   */
  attach() {
    this.__janus.attach({
      plugin: JANUS_PLUGIN,
      opaqueId: this.__userId,
      // Called when plugin attached
      success: pluginHandle => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('plugin attached');

        this.__pluginHandle = pluginHandle;
        this._joinAsSubscriber();
      },

      // Triggered after `getUserMedia` is called (isAllowed=true means that request for user media is accepted)
      consentDialog: isAllowed => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('Consent dialog', isAllowed);
      },

      // Notifies that WebRTC connection between the computer and Janus is established (or is down)
      // reason is presented in some cases when state = false
      webrtcState: (state, reason) => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('webrtcState', state, reason);
      },

      // Presents an ICE state for that moment
      // Meanings for state in simple words:
      // 'new', 'checking': Connection is being established, not at connected
      // 'connected', 'completed': Path for media stream is available
      // 'disconnected', 'failed': Media path is not available
      iceState: state => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('iceState', state);
      },

      // Triggered when Janus starts or stops receiving client's media
      mediaState: (type, isActive) => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('mediaState', type, isActive);
        this.emit('media-state', isActive);
      },

      // Notifies when some of packets are lost
      // uplink=true when some of packets from Janus are lost
      // uplink=false when all of our packets is not received by Janus
      slowLink: uplink => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('slowLink', uplink);
        this.emit('video-slow-link', uplink);
      },

      // Handle a message from plugin
      onmessage: (message, jsep) => {
        if (this.__detached) {
          return;
        }
        const event = message.videoroom;

        switch (true) {
          case event === 'joined':
            cnsl.info(`Already are publishing: `);
            cnsl.log(message.publishers)
            this._onJoinedChannel(message);
            break;
          case !!message.unpublished:
            cnsl.info(`Unpublished: ${message.unpublished}`);
            this._onUnpublished(message);
            break;
          case event === 'event' && !!message.id:
            cnsl.info(`new publisher: `);
            cnsl.log(message)
            this._onPublished(message);
            break;
          case jsep !== undefined && jsep !== null:
            this.emit('success-publishing');
            this._onRemoteJsep(jsep);
            break;
          default:
            cnsl.debug('message', message, jsep);
        }
      },

      // Local audio stream is available
      onlocalstream: stream => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('localstream', stream);
        this._onLocalVideoStream(stream);
      },

      // Data Channel is available
      ondataopen: () => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('dataopen');
      },

      // Some data is received through the Data Channel
      ondata: data => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('data', data);
      },

      // WebRTC connection with the plugin was closed
      oncleanup: () => {
        if (this.__detached) {
          return;
        }
        cnsl.debug('cleanup');
        this.emit('webrtc-cleanup');
      },

      // Plugin is detached (it can't be used)
      detached: () => {
        this.__detached = true;
        cnsl.debug('detached');
      },
    });
  }

  /**
   * Create offer and send video stream to another participants
   * @param {object} stream Video stream
   * @param {number} bitrate Video bitrate
   * @returns {void}
   */
  publishVideo(stream, bitrate) {
    this.__pluginHandle.createOffer({
      stream,
      success: jsep => {
        this.__pluginHandle.send({
          message: {
            request: 'publish',
            bitrate,
            audio: false,
            video: true,
            display: this.__userId,
          },
          jsep,
        });
      },
    });
  }

  /**
   * Unpublish current video stream
   * @returns {void}
   */
  unpublishVideo() {
    cnsl.debug('Stop local video stream');
    if (this.__localVideoStream) {
      mediaCapturer.destroyStream(this.__localVideoStream);
    }
    cnsl.debug('Unpublish');
    if (this.__pluginHandle) {
      this.__pluginHandle.send({
        message: {
          request: 'unpublish',
        },
      });
    }
  }

  /**
   * Replace old video with new stream;
   * @param {MediaStream} stream New video stream
   * @returns {void}
   */
  async replaceStream(stream) {
    const untilCleanUp = new Promise((resolve, reject) => {
      let timeoutError = null;
      this.once('webrtc-cleanup', () => {
        clearInterval(timeoutError);
        timeoutError = null;
        resolve();
      });
      setTimeout(() => {
        reject(new Error('Waiting unpublish error'));
      }, WAITING_UNPUBLISH_TIMEOUT);
    })
    this.unpublishVideo();
    await untilCleanUp;
    this.publishVideo(stream);
  }

  /**
   * Detached videoroom plugin from Janus
   * @returns {undefined}
   */
  detach() {
    if (this.__pluginHandle) {
      this.__pluginHandle.detach();
      this.__pluginHandle = null;
    }
    if (this.__localVideoStream) {
      mediaCapturer.destroyStream(this.__localVideoStream);
      this.__localVideoStream = null;
    }
  }

  /**
   * Send message about join to the channel
   * @returns {undefined}
   */
  _joinAsSubscriber() {
    this.__pluginHandle.send({
      message: {
        request: 'join',
        ptype: 'publisher',
        room: this.__room,
        display: this.__userId,
        token: this.__token,
      },
    });
  }

  /**
   * Handles client joined the channel
   * @param {object} message Janus event message object
   * @returns {undefined}
   */
  _onJoinedChannel(message) {
    cnsl.debug('room joined', message);

    this.emit('active-publishers', message.publishers);
  }

  /**
   * Handle new active publisher in the room
   * @param {object} message Janus event message object
   * @returns {void}
   */
  _onPublished(message) {
    cnsl.debug('new publisher', message);

    this.emit('publisher-joined', message);
  }

  /**
   * Handle a publisher left the room
   * @param {object} message Janus event message object
   * @returns {void}
   */
  _onUnpublished(message) {
    cnsl.debug('remove publisher', message);

    this.emit('publisher-left', message);
  }

  /**
   * Handles remote jsep
   * @param {object} jsep Remote jsep object
   * @returns {undefined}
   */
  _onRemoteJsep(jsep) {
    cnsl.debug('handle remote jsep', jsep);
    this.__pluginHandle.handleRemoteJsep({ jsep });
  }

  /**
   * Handles local video stream
   * @param {object} stream Local video stream
   * @returns {void}
   */
  _onLocalVideoStream(stream) {
    this.__localVideoStream = stream;
    this.emit('local-video-stream', stream);
  }
};

export default PublishingVideoroomPlugin;
