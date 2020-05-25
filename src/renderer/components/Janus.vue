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
    };
  },
  computed: {
    ...mapState('janus', {
      janusOptions: state => state,
    }),
    ...mapState('app', {
      microphoneVolume: state => state.microphoneVolume,
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

      this.unselectChannel();
      this.selectChannel();
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
      if (state) {
        console.log('button');
        const checkDelay = 1000; // milliseconds

        setTimeout(this.checkAudio(), checkDelay);
      }
    },

    /**
     * Reacts on speakers state is changed
     * @param {boolean} state Is speakers enabled
     * @returns {undefined}
     */
    speakers(state) {
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

      janusWrapper.on('connection-error', this.onConnectionError.bind(this));
      janusWrapper.on('remote-audio-stream', this.onRemoteAudioStream.bind(this));
      janusWrapper.on('audio-stream-active', this.onAudioStreamActive.bind(this));
      janusWrapper.on('speaking', this.onSpeakingChange.bind(this));
      janusWrapper.on('volume-change', this.onVolumeChange.bind(this));

      await janusWrapper.join();
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
          console.log('audiostr');
          const checkDelay = 1000; // milliseconds

          setTimeout(this.checkAudio(), checkDelay);
        }
        if (this.speakers) {
          this.$refs.audio.muted = false;
        }
      }
    },

    async checkAudio() {
      const HALF_VOL = -80;

      if (this.microphoneVolume < HALF_VOL) {
        const notification = {
          data: {
            text: `Speak up!`,
            buttons: [
              {
                text: 'Connect',
                type: 1,
              },
              {
                text: 'Cancel',
                close: true,
              },
            ],
          },
        };

        await this.$store.dispatch('app/addNotification', notification);
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