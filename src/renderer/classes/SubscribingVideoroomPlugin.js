import { EventEmitter } from 'events';
import mediaCapturer from '@classes/mediaCapturer';
import Logger from '@sdk/classes/logger';
const cnsl = new Logger('Subscribing Videoroom Plugin', '#F1C40F');
const JANUS_PLUGIN = 'janus.plugin.videoroom';

/**
 * Handle communication with videoroom plugin for subscribing
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
   * @param {string} options.janusId Janus user subscribe for
   */
  constructor(options) {
    super();

    const {
      janus,
      room,
      token,
      userId,
      janusId,
    } = options;

    this.__janus = janus;
    this.__room = room;
    this.__token = token;
    this.__userId = userId;
    this.__janusId = janusId;

    this.__detached = false;
    this.__pluginHandle = null;
    this.__remoteVideoStream = null;
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
          cnsl.debug('Plugin detached and can\'t reveive any messages');

          return;
        }
        cnsl.debug('message', message, jsep);

        if (message.videoroom === 'event') {
          if (message.switched === 'ok') {
            this.emit('switched');
          } else if (message.paused === 'ok') {
            this.emit('paused');
          } else if (message.started === 'ok') {
            this.emit('started');
          }
        }

        if (jsep !== undefined && jsep !== null) {
          cnsl.info(`New message with jsep for ${this.__janusId}, ${this.__userId}! `);
          this._startStreamReceiving(jsep);
        }
      },

      // Remote audio stream is available
      onremotestream: stream => {
        if (this.__detached) {
          return;
        }
        cnsl.info(`Remote stream for ${this.__janusId}, ${this.__userId}! `);

        cnsl.debug('remotestream', stream);
        this.__remoteVideoStream = stream;
        this.emit('remote-video-stream', stream);
      },

      // WebRTC connection with the plugin was closed
      oncleanup: () => {
        if (this.__detached) {
          return;
        }
        this.emit('webrtc-cleanup');
        cnsl.debug('cleanup');
      },

      // Plugin is detached (it can't be used)
      detached: () => {
        this.__detached = true;
        cnsl.debug('detached');
      },
    });
  }

  /**
   * Set receiving vide stream on pause
   * @returns {void}
   */
  pause() {
    if (!this.__pluginHandle || this.__detached) {
      return;
    }

    this.__pluginHandle.send({
      message: {
        request: 'pause',
      },
    });
  }

  /**
   * Resume receiving video stream
   * @returns {void}
   */
  resume() {
    if (!this.__pluginHandle || this.__detached) {
      return;
    }

    this.__pluginHandle.send({
      message: {
        request: 'start',
      },
    });
  }

  /**
   * Switch plugin subscription to another publisher
   * @param {number} janusId Switch plugin to another publisher
   * @returns {void}
   */
  switch(janusId) {
    if (!this.__pluginHandle || this.__detached) {
      return;
    }

    cnsl.log('Subscription plugin handle switching: ', janusId);
    this.__pluginHandle.send({
      message: {
        request: 'switch',
        feed: typeof janusId === 'number' ? janusId : parseInt(janusId, 10),
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
    if (this.__remoteVideoStream) {
      mediaCapturer.destroyStream(this.__remoteVideoStream);
      this.__remoteVideoStream = null;
    }
  }

  /**
   * Send message about join to the channel
   * @returns {undefined}
   */
  _joinAsSubscriber() {
    const msg = {
      request: 'join',
      ptype: 'subscriber',
      feed: parseInt(this.__janusId, 10),
      room: this.__room,
      display: this.__userId,
      token: this.__token,
    };

    cnsl.info(`Join to videoroom for subscribing! `);
    cnsl.log(msg);
    this.__pluginHandle.send({
      message: msg,
    });
  }

  /**
   * Start receiving remote stream
   * @param {object} jsep Remote jsep object
   * @returns {void}
   */
  _startStreamReceiving(jsep) {
    // create local sdp (jsep)
    this.__pluginHandle.createAnswer({
      jsep,
      media: {
        audioSend: false,
        videoSend: false,
      },
      success: ourjsep => {
        // send local sdp with 'start' event to the janus
        this.__pluginHandle.send({
          message: {
            request: 'start',
          },
          jsep: ourjsep,
        });
        cnsl.debug('Start receiving video');
      },
      error: err => {
        cnsl.debug(`Create answer for subscription ${this.__janusId} error: `, err);
      },
    });
  }
};

export default VideoroomPlugin;
