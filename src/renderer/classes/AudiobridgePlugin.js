import { EventEmitter } from 'events';
import hark from 'hark';
const JANUS_PLUGIN = 'janus.plugin.audiobridge';
const HARK_UPDATE_INTERVAL_MS = 75;

/**
 * Handle communication with audiobridge plugin
 * @class
 */
class AudiobridgePlugin extends EventEmitter {
  /**
   * Creates an instance of audiobridge plugin class
   * @param {object} options Audiobridge plugin config
   * @param {object} options.janus An active Janus connection
   * @param {number} options.room Room in audiobridge plugin
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
    this.__maxBitrate = 48;
    this.__debugEnabled = debug;

    // hark stream
    this.__harkStream = null;

    this.__detached = false;
    this.__pluginHandle = null;
  }

  /**
   * Attaches audiobridge plugin and join room
   * @returns {undefined}
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
        this._joinChannel();
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
        const event = message.audiobridge;

        switch (true) {
          case event === 'joined':
            this._onJoinedChannel(message);
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
        this._onLocalAudioStream(stream);
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
   * Detached audiobridge plugin from Janus
   * @returns {undefined}
   */
  detach() {
    if (this.__pluginHandle) {
      this.__pluginHandle.detach();
      this.__pluginHandle = null;
    }
    if (this.__harkStream) {
      this.__harkStream.stop();
      this.__harkStream = null;
    }
  }

  /**
   * Mute/unmute current participant
   * @param {boolean} muted Should the participant be muted
   * @returns {undefined}
   */
  setMuting(muted) {
    this.__pluginHandle.send({
      message: {
        request: 'configure',
        muted: muted,
      },
    });
  }

  /**
   * Send message about join to the channel
   * @returns {undefined}
   */
  _joinChannel() {
    this.__pluginHandle.send({
      message: {
        request: 'join',
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
      console.log('Audiobridge plugin: ', ...arguments);
    }
  }

  /**
   * Handles client joined the channel
   * @param {object} message Janus event message object
   * @returns {undefined}
   */
  _onJoinedChannel(message) {
    this._debug('room joined', message);

    this.__pluginHandle.createOffer({
      media: {
        video: false,
        audio: true,
      },
      success: jsep => {
        this.__pluginHandle.send({
          message: {
            request: 'configure',
            muted: true,
          },
          jsep,
        });
      },
      error: error => {
        this._debug('create offer error', error);
      },
    });
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
   * Handles local audio stream
   * @param {object} stream Audio stream object
   * @returns {undefined}
   */
  _onLocalAudioStream(stream) {
    this.__harkStream = hark(stream, {
      interval: HARK_UPDATE_INTERVAL_MS,
    });
    this.__harkStream.on('speaking', () => {
      this.emit('start-speaking');
    });
    this.__harkStream.on('stopped_speaking', () => {
      this.emit('stop-speaking');
    });
    this.__harkStream.on('volume_change', (db, threshold) => {
      this.emit('volume-change', db);
    });
  }
};

export default AudiobridgePlugin;