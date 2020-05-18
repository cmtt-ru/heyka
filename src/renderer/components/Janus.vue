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
import { mapState } from 'vuex';

export default {
  name: 'Janus',
  data() {
    return {
      janusWrapper: null,
      socketDisconnectedDelay: null,
      videoPublishers: {},
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
      screen: state => state.mediaState.screen,
      camera: state => state.mediaState.camera,
    }),
    ...mapState([ 'isSocketConnected' ]),
    ...mapState('app', {
      selectedCameraDevice: state => state.selectedDevices.camera,
    }),
  },
  watch: {
    /**
     * Reacts on channel is changed
     * @param {string} id New channel id
     * @param {string} oldId Previous channel id
     * @returns {nothing}
     */
    selectedChannelId(id, oldId) {
      if (id === null || id === '') {
        this.unselectChannel();

        return this.log('Channel is deselected');
      }

      if (oldId === null || oldId === '') {
        this.selectChannel();

        return this.log('Channel is selected for the first time');
      }
    },

    /**
     * Reacts on microphone state is changed
     * @param {boolean} state Is microphone enabled
     * @returns {undefined}
     */
    microphone(state) {
      if (!this.janusWrapper) {
        return;
      }
      this.janusWrapper.setMuting(!state);
    },

    /**
     * Reacts on speakers state is changed
     * @param {boolean} state Is speakers enabled
     * @returns {undefined}
     */
    speakers(state) {
      this.$refs.audio.muted = !state;
    },

    /**
     * Handles change camera state
     * @param {boolean} state Is camera sharing enabled
     * @returns {void}
     */
    camera(state) {
      if (state) {
        this.startSharingCamera();
      } else {
        this.stopSharingVideo();
      }
    },

    /**
     * Handles change screen sharing state
     * @param {boolean} state Is screen sharing enabled
     * @returns {void}
     */
    screen(state) {
      if (state) {
        this.startSharingScreen();
      } else {
        this.stopSharingVideo();
      }
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

        if (!this.janusWrapper) {
          this.selectChannel();
        }
      }
    },
  },
  async created() {
    await JanusWrapper.init();
    this.log('JanusWrapper was initialized');
  },
  beforeDestroy() {
    if (this.janusWrapper) {
      this.janusWrapper.disconnect();
    }
  },
  methods: {
    /**
     * Join to the Janus channel
     * Subscribe for event from JanusWrapper
     * @returns {undefined}
     */
    async selectChannel() {
      const janusWrapper = new JanusWrapper({
        ...this.janusOptions,
        userId: this.userId,
        debug: process.env.VUE_APP_JANUS_DEBUG === 'true',
      });

      this.janusWrapper = janusWrapper;

      // audio events
      janusWrapper.on(JanusWrapper.events.connectionError, this.onConnectionError.bind(this));
      janusWrapper.on(JanusWrapper.events.removeAudioStream, this.onRemoteAudioStream.bind(this));
      janusWrapper.on(JanusWrapper.events.audioStreamActive, this.onAudioStreamActive.bind(this));
      janusWrapper.on(JanusWrapper.events.speaking, this.onSpeakingChange.bind(this));
      janusWrapper.on(JanusWrapper.events.volumeChange, this.onVolumeChange.bind(this));

      // video events
      janusWrapper.on(JanusWrapper.events.videoPublishersList, this.onVideoPublishersList.bind(this));
      janusWrapper.on(JanusWrapper.events.videoPublisherJoined, this.onVideoPublisherJoined.bind(this));
      janusWrapper.on(JanusWrapper.events.videoPublisherLeft, this.onVideoPublisherLeft.bind(this));

      await janusWrapper.join();

      // start sharing camera if camera is enabled
      if (this.camera) {
        this.startSharingCamera();
      }
      if (this.screen) {
        this.startSharingScreen();
      }
    },

    /**
     * Leave the Janus channel
     * @returns {undefined}
     */
    unselectChannel() {
      if (this.janusWrapper) {
        this.janusWrapper.removeAllListeners('connection-error');
        this.janusWrapper.removeAllListeners('remote-audio-stream');
        this.janusWrapper.removeAllListeners('audio-stream-active');
        this.janusWrapper.disconnect();
        this.janusWrapper = null;
      }
    },

    /**
     * Start sharing video from a camera device
     * @returns {void}
     */
    startSharingCamera() {
      if (!this.janusWrapper) {
        this.log('Janus wrapper is not existed');

        return;
      }

      this.janusWrapper.publishVideoStream('camera', this.selectedCameraDevice);
    },

    /**
     * Start sharing video from the screen
     * @returns {void}
     */
    startSharingScreen() {
      if (!this.janusWrapper) {
        this.log('Janus wrapper is not existed');

        return;
      }

      this.janusWrapper.publishVideoStream('screen', this.janusOptions.sharingSource.id);
    },

    /**
     * Stop sharing any video
     * @returns {void}
     */
    stopSharingVideo() {
      this.janusWrapper.unpublishVideoStream();
    },

    /**
     * Handles remote audio stream
     * @param {object} stream remote audio stream
     * @returns {undefined}
     */
    onRemoteAudioStream(stream) {
      this.log('Attach audio stream to the audio element');
      JanusWrapper.attachMediaStream(this.$refs.audio, stream);
    },

    /**
     * Handles Janus connection error
     * @param {string} errorCode Janus error code
     * @returns {undefined}
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
     * @returns {undefined}
     */
    onAudioStreamActive(isActive) {
      if (isActive) {
        if (this.microphone) {
          this.janusWrapper.setMuting(false);
        }
        if (this.speakers) {
          this.$refs.audio.muted = false;
        }
      }
    },

    /**
     * Handles user speaking state changes
     * @param {boolean} isSpeaking is user speaking
     * @returns {undefined}
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
     * Handle new publisher list, set new object of publishers
     * @param {array} publishers List of publishers
     * @returns {void}
     */
    onVideoPublishersList(publishers) {
      this.videoPublishers = {};
      publishers.forEach(publisher => {
        // publisher.display - heyka user id
        // publisher.id - janus publisher id
        this.videoPublishers[publisher.display] = {
          userId: publisher.display,
          janusId: publisher.id,
        };
      });
    },

    /**
     * Handle new publisher, add new publisher to publisher list
     * @param {object} publisher Publicher object
     * @returns {void}
     */
    onVideoPublisherJoined(publisher) {
      this.videoPublishers[publisher.display] = {
        userId: publisher.display,
        janusId: publisher.id,
      };
    },

    /**
     * Handle publisher left, remove publisher from publisher list
     * @param {object} publisher Publicher object
     * @returns {void}
     */
    onVideoPublisherLeft(publisher) {
      delete this.videoPublishers[publisher.display];
    },

    /**
     * Handles socket is disconnected
     * @returns {void}
     */
    onSocketDisconnected() {
      this.unselectChannel();
    },

    /**
     * Internal log function
     * @returns {nothing}
     */
    log() {
      console.log('JANUS.VUE: ', ...arguments);
    },
  },
};
</script>