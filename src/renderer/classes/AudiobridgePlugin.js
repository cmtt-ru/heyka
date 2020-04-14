import { EventEmitter } from 'events';
const JANUS_PLUGIN = 'janus.plugin.audiobridge';

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

    this.__pluginHandle = null;
  }

  /**
   * Attaches audiobridge plugin and join room
   * @returns {undefined}
   */
  attach() {
    this.__janus.setMaxAudioBitrate(this.__maxBitrate);
    this.__janus.attach({
      plugin: JANUS_PLUGIN,
      // Called when plugin attached
      success: pluginHandle => {
        this.__debug('plugin attached');

        this.__pluginHandle = pluginHandle;
        this.__joinChannel();
      },

      // Triggered after `getUserMedia` is called (isAllowed=true means that request for user media is accepted)
      consentDialog: isAllowed => {
        this.__debug('Consent dialog', isAllowed);
      },

      // Notifies that WebRTC connection between the computer and Janus is established (or is down)
      // reason is presented in some cases when state = false
      webrtcState: (state, reason) => {
        this.__debug('webrtcState', state, reason);
      },

      // Presents an ICE state for that moment
      // Meanings for state in simple words:
      // 'new', 'checking': Connection is being established, not at connected
      // 'connected', 'completed': Path for media stream is available
      // 'disconnected', 'failed': Media path is not available
      iceState: state => {
        this.__debug('iceState', state);
      },

      // Triggered when Janus starts or stops receiving client's media
      mediaState: (type, isActive) => {
        this.__debug('mediaState', type, isActive);
      },

      // Notifies when some of packets are lost
      // uplink=true when some of packets from Janus are lost
      // uplink=false when all of our packets is not received by Janus
      slowLink: uplink => {
        this.__debug('slowLink', uplink);
      },

      // Handle a message from plugin
      onmessage: (message, jsep) => {
        const event = message.audiobridge;

        switch (true) {
          case event === 'joined':
            this.__onJoinedChannel(message);
            break;
          case jsep !== undefined && jsep !== null:
            this.__onRemoteJsep(jsep);
            break;
          default:
            this.__debug('message', message, jsep);
        }
      },

      // Local audio stream is available
      onlocalstream: stream => {
        this.__debug('localstream', stream);
      },

      // Remote audio stream is available
      onremotestream: stream => {
        this.__debug('remotestream', stream);
<<<<<<< HEAD
        this.emit('remote-audio-stream', stream);
=======
>>>>>>> 87efdaedb7bcdabe7f7c0c293ee344d91f8a2147
      },

      // Data Channel is available
      ondataopen: () => {
        this.__debug('dataopen');
      },

      // Some data is received through the Data Channel
      ondata: data => {
        this.__debug('data', data);
      },

      // WebRTC connection with the plugin was closed
      oncleanup: () => {
        this.__debug('cleanup');
      },

      // Plugin is detached (it can't be used)
      detached: () => {
        this.__debug('detached');
      },
    });
  }

  /**
   * Send message about join to the channel
   * @returns {undefined}
   */
  __joinChannel() {
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
  __debug() {
    if (this.__debugEnabled) {
      console.log('Audiobridge plugin: ', ...arguments);
    }
  }

  /**
   * Handles client joined the channel
   * @param {object} message Janus event message object
   * @returns {undefined}
   */
  __onJoinedChannel(message) {
    this.__debug('room joined', message);

    this.__pluginHandle.createOffer({
      media: {
        video: false,
        audio: true,
      },
      success: jsep => {
        this.__pluginHandle.send({
          message: {
            request: 'configure',
<<<<<<< HEAD
            muted: true,
=======
            muted: false,
>>>>>>> 87efdaedb7bcdabe7f7c0c293ee344d91f8a2147
          },
          jsep,
        });
      },
      error: error => {
        this.__debug('create offer error', error);
      },
    });
  }

  /**
   * Handles remote jsep
   * @param {object} jsep Remote jsep object
   * @returns {undefined}
   */
  __onRemoteJsep(jsep) {
    this.__debug('handle remote jsep', jsep);
    this.__pluginHandle.handleRemoteJsep({ jsep });
  }
};

export default AudiobridgePlugin;