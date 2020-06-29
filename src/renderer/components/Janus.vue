<template>
  <div>
    <audio
      ref="audio"
      autoplay
      muted
    />
  </div>
</template>

<script>
import JanusWrapper from '@classes/JanusWrapper.js';
import connectionCheck from '@classes/connectionCheck';
import AudioCheck from '@classes/AudioCheck';
import { mapState } from 'vuex';

/**
 * Video publishers
 * @type {object}
 */
const videoPublishers = {};

/**
 * Stream host instance
 * @type {object}
 */
const streamHost = null;

/**
 * Janus wrapper instance
 * @type {object}
 */
let janusWrapper = null;

export default {
  name: 'Janus',
  data() {
    return {
      socketDisconnectedDelay: null,
      currentOperation: '',
    };
  },
  computed: {
    ...mapState('janus', {
      janusOptions: state => state,
    }),
    ...mapState('me', {
      selectedChannelId: 'selectedChannelId',
      userId: 'id',
      mediaState: 'mediaState',
      microphone: state => state.mediaState.microphone,
      speakers: state => state.mediaState.speakers,
      speaking: state => state.mediaState.speaking,
    }),
    ...mapState([ 'isSocketConnected' ]),
    ...mapState('app', {
      selectedMicrophoneDevice: state => state.selectedDevices.microphone,
      selectedSpeakerDevice: state => state.selectedDevices.speaker,
      microphonesDeviceList: state => state.devices.microphones,
      speakersDeviceList: state => state.devices.speakers,
    }),
  },
  watch: {
    /**
     * Reacts on channel is changed
     * @param {string} id New channel id
     * @param {string} oldId Previous channel id
     * @returns {void}
     */
    selectedChannelId(id, oldId) {
      if (oldId !== null) {
        this.log('Channel unselect');
        this.unselectChannel();
      }
      if (id !== null) {
        this.log('Channel select');
        this.selectChannel();
      }
    },

    /**
     * Reacts on microphone state is changed
     * @param {boolean} state Is microphone enabled
     * @returns {void}
     */
    microphone(state) {
      if (!janusWrapper) {
        return;
      }
      janusWrapper.setMuting(!state);
      if (state) {
        AudioCheck.checkAudio();
      }
    },

    /**
     * Reacts on speakers state is changed
     * @param {boolean} state Is speakers enabled
     * @returns {void}
     */
    speakers(state) {
      console.log(`Set muting of speakers ${!state}`);
      this.$refs.audio.muted = !state;
    },

    isSocketConnected(value) {
      const disconnectedReactionDelay = 1000; // milliseconds
      const isChannelSelected = this.selectedChannelId !== '' && this.selectedChannelId !== null;

      if (!isChannelSelected) {
        return;
      }

      if (!value) {
        if (this.socketDisconnectedDelay) {
          clearTimeout(this.socketDisconnectedDelay);
          this.socketDisconnectedDelay = null;
        }
        this.socketDisconnectedDelay = setTimeout(() => {
          this.onSocketDisconnected();
        }, disconnectedReactionDelay);
      } else {
        if (this.socketDisconnectedDelay) {
          clearTimeout(this.socketDisconnectedDelay);
          this.socketDisconnectedDelay = null;
        }

        if (!janusWrapper) {
          this.selectChannel();
        }
      }
    },

    selectedSpeakerDevice(deviceId) {
      this.$refs.audio.setSinkId(deviceId);
    },

    selectedMicrophoneDevice(deviceId) {
      if (janusWrapper) {
        janusWrapper.setMicrophoneDevice(deviceId);
      }
    },

    microphonesDeviceList() {
      if (this.selectedMicrophoneDevice === 'default') {
        if (janusWrapper) {
          janusWrapper.setMicrophoneDevice(this.selectedMicrophoneDevice);
        }
      }
    },

    speakersDeviceList() {
      if (this.selectedSpeakerDevice === 'default') {
        this.$refs.audio.setSinkId(this.selectedSpeakerDevice);
      }
    },
  },
  async created() {
    await JanusWrapper.init();
    this.log('JanusWrapper was initialized');
  },
  beforeDestroy() {
    if (janusWrapper) {
      janusWrapper.disconnect();
    }
  },
  destroyed() {
    AudioCheck.destroyMediaStream();
  },
  methods: {
    setOperationStart(operation) {
      this.$store.dispatch('janus/setInProgress', true);
      this.currentOperation = operation;
      console.log('%c setOperationStart', 'background: #C9EAD7; color: black', operation);
    },
    setOperationFinish(operation) {
      console.log('%c setOperationFinish', 'background: #C9EAD7; color: black', operation);
      if (operation === this.currentOperation) {
        this.$store.dispatch('janus/setInProgress', false);
        console.log(this.$store.state.janus);
        this.currentOperation = '';
      }
    },
    /**
     * Join to the Janus channel
     * Subscribe for event from JanusWrapper
     * @returns {undefined}
     */
    async selectChannel() {
      // Set janus "inProgress" status

      janusWrapper = new JanusWrapper({
        ...this.janusOptions,
        microphoneDeviceId: this.selectedMicrophoneDevice,
        userId: this.userId,
        debug: process.env.VUE_APP_JANUS_DEBUG === 'true',
      });

      // common events
      janusWrapper.on(JanusWrapper.events.channelJoined, () => {
        if (this.microphone) {
          AudioCheck.checkAudio();
        }
      });

      // audio events
      janusWrapper.on(JanusWrapper.events.connectionError, this.onConnectionError.bind(this));
      janusWrapper.on(JanusWrapper.events.remoteAudioStream, this.onRemoteAudioStream.bind(this));
      janusWrapper.on(JanusWrapper.events.audioStreamActive, this.onAudioStreamActive.bind(this));
      janusWrapper.on(JanusWrapper.events.speaking, this.onSpeakingChange.bind(this));
      janusWrapper.on(JanusWrapper.events.volumeChange, this.onVolumeChange.bind(this));
      janusWrapper.on(JanusWrapper.events.audioSlowLink, this.onAudioSlowLink.bind(this));

      await janusWrapper.join();
    },

    /**
     * Leave the Janus channel
     * @returns {void}
     */
    unselectChannel() {
      if (janusWrapper) {
        janusWrapper.removeAllListeners('connection-error');
        janusWrapper.removeAllListeners('remote-audio-stream');
        janusWrapper.removeAllListeners('audio-stream-active');
        janusWrapper.disconnect();
        janusWrapper = null;
      }
      Object.keys(videoPublishers).forEach(key => {
        this.$delete(videoPublishers, key);
      });
      streamHost.clearAll();
    },

    /**
     * Handles remote audio stream
     * @param {object} stream remote audio stream
     * @returns {void}
     */
    onRemoteAudioStream(stream) {
      this.log('Attach audio stream to the audio element');
      JanusWrapper.attachMediaStream(this.$refs.audio, stream);
      this.$refs.audio.muted = !this.speakers;
      this.$refs.audio.setSinkId(this.selectedSpeakerDevice);
    },

    /**
     * Handles Janus connection error
     * @param {string} errorCode Janus error code
     * @returns {void}
     */
    onConnectionError(errorCode) {
      switch (errorCode) {
        case JanusWrapper.errors.SERVER_DOWN:
          this.log('Janus server is down');
          break;
        case JanusWrapper.errors.AUTHENTICATION_ERROR:
          this.log('Janus authentication error');
          break;
        case JanusWrapper.errors.UNKNOW:
          this.log('An unknow error');
          break;
      }
    },

    /**
     * Handles event when media connection activity is changed
     * @param {boolean} isActive Is media connection active
     * @returns {void}
     */
    onAudioStreamActive(isActive) {
      console.log('------ onAudioStreamActive');
      if (isActive) {
        if (this.microphone) {
          janusWrapper.setMuting(false);
          console.log('------ setMuting false');
        }
        if (this.speakers) {
          this.$refs.audio.muted = false;
        }
      }
    },

    /**
     * Handles user speaking state changes
     * @param {boolean} isSpeaking is user speaking
     * @returns {void}
     */
    onSpeakingChange(isSpeaking) {
      // ignore speaking state if you are muted
      if (!this.microphone) {
        return;
      }
      if (this.speaking !== isSpeaking) {
        this.$store.dispatch('me/setMediaState', {
          ...this.mediaState,
          speaking: isSpeaking,
        });
      }
    },

    /**
     * Handles change microphone volume
     * @param {number} db Microphone volume in decibels
     * @returns {void}
     */
    onVolumeChange(db) {
      this.$store.dispatch('app/setMicrophoneVolume', db);
    },

    /**
     * Handles socket is disconnected
     * @returns {void}
     */
    onSocketDisconnected() {
      this.unselectChannel();
    },

    /**
     * Handle local video stream
     * @param {MediaStream} stream Media stream
     * @returns {void}
     */
    async onLocalVideoStream(stream) {
      streamHost.closeStreamSharing(this.userId);
      videoPublishers[this.userId] = {
        userId: this.userId,
        stream,
      };
      // await new Promise(resolve => this.$nextTick(resolve));
      // Insert stream
      // const el = this.$refs[`video${this.userId}`][0];
      //
      // el.srcObject = stream;
      // el.onloadedmetadata = function () {
      //   el.play();
      // };
    },

    /**
     * Handle audio slow link
     * @param {boolean} uplink - false when all of our packets is not received by Janus, true – some packets lost
     * @returns {void}
     */
    onAudioSlowLink(uplink) {
      connectionCheck.handleSlowInternet(true);
    },

    /**
     * Handle webrtc clean up
     * @returns {void}
     */
    onWebrtcCleanUp() {
      this.$store.dispatch('janus/setInProgress', false);
    },

    /**
     * Internal log function
     * @returns {void}
     */
    log() {
      console.log('JANUS.VUE: ', ...arguments);
    },
  },
};
</script>
