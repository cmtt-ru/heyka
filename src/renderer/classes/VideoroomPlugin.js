import { EventEmitter } from 'events';
import mediaCapturer from './mediaCapturer';
import Janus from './janus';
const JANUS_PLUGIN = 'janus.plugin.videoroom';
const DEFAULT_BITRATE = 1400000;
/* eslint-disable */

/**
 * Handle communication with videoroom plugin
 * @class
 */
class VideoroomPlugin extends EventEmitter {
  /**
   * Creates an instance of videoroom plugin class
   * @param {object} options videoroom plugin config
   * @param {object} options.janus An active Janus connection
   * @param {number} options.room Room in videoroom plugin
   * @param {string} options.token Authentication token for room
   * @param {string} options.userId Connected user id
   * @param {boolean} [options.debug=false] Is debug output enabled
   */
  constructor(options) {
    super();

    const {
      janus,
      room,
      token,
      userId,
      debug = false,
    } = options;

    this.__janus = janus;
    this.__room = room;
    this.__token = token;
    this.__userId = userId;
    this.__debugEnabled = debug;

    this.__detached = false;
    this.__pluginHandle = null;
    this.__videoPluginHandles = {};
  }

  /**
   * Attaches videoroom plugin and join room
   * @returns {void}
   */
  attach() {
    this.__janus.attach({
      plugin: JANUS_PLUGIN,
      // Called when plugin attached
      success: pluginHandle => {
        if (this.__detached) {
          return;
        }
        this._debug('plugin attached');

        this.__pluginHandle = pluginHandle;
        this._joinAsSubscriber();
      },

      // Triggered after `getUserMedia` is called (isAllowed=true means that request for user media is accepted)
      consentDialog: isAllowed => {
        if (this.__detached) {
          return;
        }
        this._debug('Consent dialog', isAllowed);
      },

      // Notifies that WebRTC connection between the computer and Janus is established (or is down)
      // reason is presented in some cases when state = false
      webrtcState: (state, reason) => {
        if (this.__detached) {
          return;
        }
        this._debug('webrtcState', state, reason);
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
        this._debug('iceState', state);
      },

      // Triggered when Janus starts or stops receiving client's media
      mediaState: (type, isActive) => {
        if (this.__detached) {
          return;
        }
        this._debug('mediaState', type, isActive);
        this.emit('media-state', isActive);
      },

      // Notifies when some of packets are lost
      // uplink=true when some of packets from Janus are lost
      // uplink=false when all of our packets is not received by Janus
      slowLink: uplink => {
        if (this.__detached) {
          return;
        }
        this._debug('slowLink', uplink);
      },

      // Handle a message from plugin
      onmessage: (message, jsep) => {
        if (this.__detached) {
          return;
        }
        const event = message.videoroom;

        switch (true) {
          case event === 'joined':
            this._onJoinedChannel(message);
            break;
          case !!message.unpublished:
            this._onUnpublished(message);
            break;
          case event === 'event' && !!message.id:
            this._onPublished(message);
            break;
          case jsep !== undefined && jsep !== null:
            this._onRemoteJsep(jsep);
            break;
          default:
            this._debug('message', message, jsep);
        }
      },

      // Local audio stream is available
      onlocalstream: stream => {
        if (this.__detached) {
          return;
        }
        this._debug('localstream', stream);
        this._onLocalVideoStream(stream);
      },

      // Remote audio stream is available
      onremotestream: stream => {
        if (this.__detached) {
          return;
        }
        this._debug('remotestream', stream);
        this.emit('remote-audio-stream', stream);
      },

      // Data Channel is available
      ondataopen: () => {
        if (this.__detached) {
          return;
        }
        this._debug('dataopen');
      },

      // Some data is received through the Data Channel
      ondata: data => {
        if (this.__detached) {
          return;
        }
        this._debug('data', data);
      },

      // WebRTC connection with the plugin was closed
      oncleanup: () => {
        if (this.__detached) {
          return;
        }
        this._debug('cleanup');
      },

      // Plugin is detached (it can't be used)
      detached: () => {
        this.__detached = true;
        this._debug('detached');
      },
    });
  }

  /**
   * Create offer and send video stream to another participants
   * @param {object} stream Video stream
   * @returns {void}
   */
  publishVideo(stream) {
    console.log(`====================== Create OFFER`);
    this.__pluginHandle.createOffer({
      stream,
      success: jsep => {
        this.__pluginHandle.send({
          message: {
            request: 'publish',
            bitrate: DEFAULT_BITRATE,
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
    this._debug('Stop local video stream');
    if (this.__localVideoStream) {
      mediaCapturer.destroyStream(this.__localVideoStream);
    }
    this._debug('Unpublish');
    if (this.__pluginHandle) {
      this.__pluginHandle.send({
        message: {
          request: 'unpublish',
        },
      });
    }
  }

  requestVideoStream(janusId) {
    this.__janus.attach({
      plugin: JANUS_PLUGIN,
      success: pluginHandle => {
        this._debug(`Subscription plugin attached`);
        pluginHandle.createOffer = function () {
          console.log('===================Offer is called');
          console.trace();
        }
        this.__videoPluginHandles[janusId] = pluginHandle;
        pluginHandle.send({
          message: {
            request: 'join',
            ptype: 'subscriber',
            room: this.__room,
            feed: parseInt(janusId, 10),
            audio: false,
            video: true,
          },
        });
      },
      onmessage: (message, jsep) => {
        this._debug(`Subscription ${janusId} message: `, message, jsep);
        if (!jsep !== undefined && jsep !== null) {
          this.__videoPluginHandles[janusId].createAnswer({
            jsep,
            media: {
              audioSend: false,
              videoSend: false,
            },
            success: jsep2 => {
              Janus.debug(jsep2);
              this.__videoPluginHandles[janusId].send({
                message: {
                  request: 'start',
                  room: this.__room,
                },
                jsep: jsep2,
              });
            },
            error: err => {
              this._debug(`Create answer for subscription ${janusId} error: `, err);
            },
          });
        }
      },
      onremotestream: stream => {
        this.emit('remote-video-stream', {
          janusId,
          stream,
        });
      },
    });
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
   * Internal debug console output
   * @private
   * @returns {undefined}
   */
  _debug() {
    if (this.__debugEnabled) {
      console.log('Videoroom plugin: ', ...arguments);
    }
  }

  /**
   * Handles client joined the channel
   * @param {object} message Janus event message object
   * @returns {undefined}
   */
  _onJoinedChannel(message) {
    this._debug('room joined', message);

    if (message.publishers.length > 0) {
      this.emit('active-publishers', message.publishers);
    }
  }

  /**
   * Handle new active publisher in the room
   * @param {object} message Janus event message object
   * @returns {void}
   */
  _onPublished(message) {
    this._debug('new publisher', message);

    this.emit('publisher-joined', message);
  }

  /**
   * Handle a publisher left the room
   * @param {object} message Janus event message object
   * @returns {void}
   */
  _onUnpublished(message) {
    this._debug('remove publisher', message);

    this.emit('publisher-left', message);
  }

  /**
   * Handles remote jsep
   * @param {object} jsep Remote jsep object
   * @returns {undefined}
   */
  _onRemoteJsep(jsep) {
    this._debug('handle remote jsep', jsep);
    this.__pluginHandle.handleRemoteJsep({ jsep });
  }

  /**
   * Handles local video stream
   * @param {object} stream Local video stream
   * @returns {void}
   */
  _onLocalVideoStream(stream) {
    this.__localVideoStream = stream;
  }
};

export default VideoroomPlugin;