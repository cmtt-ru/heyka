<template>
  <div>
    <audio
      ref="audio"
      autoplay
      muted
    />
    <!-- <video
      v-for="publisher in videoPublishers"
      :key="publisher.userId"
      :ref="`video${publisher.userId}`"
      style="width: 100px; height: 80px"
    /> -->
  </div>
</template>

<script>
import JanusWrapper from '@classes/JanusWrapper.js';
import StreamHost from '@classes/StreamSharing/Host';
import mediaCapturer from '@classes/mediaCapturer';
import connectionCheck from '@classes/connectionCheck';
import AudioCheck from '@classes/AudioCheck';
import { mapState } from 'vuex';

const WAIT_PUBLISHER_INVERVAL = 100;
const WAIT_PUBLISHER_ATTEMPTS = 20;

export default {
  name: 'Janus',
  data() {
    return {
      streamHost: null,
      janusWrapper: null,
      socketDisconnectedDelay: null,
      videoPublishers: {},
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
     * @returns {undefined}
     */
    microphone(state) {
      if (!this.janusWrapper) {
        return;
      }
      this.janusWrapper.setMuting(!state);
      if (state) {
        AudioCheck.checkAudio();
      }
    },

    /**
     * Reacts on speakers state is changed
     * @param {boolean} state Is speakers enabled
     * @returns {undefined}
     */
    speakers(state) {
      console.log(`Set muting of speakers ${!state}`);
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

    videoPublishers(val) {
      console.log('%c videoPublishers:', 'background: green;', Object.keys(val).length, val);
    },
  },
  async created() {
    await JanusWrapper.init();
    this.streamHost = new StreamHost({ debug: process.env.VUE_APP_JANUS_DEBUG === 'true' });
    this.streamHost.on('request-stream', this.onRequestStream.bind(this));
    this.log('JanusWrapper was initialized');
  },
  beforeDestroy() {
    if (this.janusWrapper) {
      this.janusWrapper.disconnect();
    }
  },
  destroyed() {
    AudioCheck.destroyMediaStream();
  },
  methods: {
    setOperationStart(operation) {
      this.$store.dispatch('janus/setInProgress', true);
      this.currentOperation = operation;
    },
    setOperationFinish(operation) {
      this.log('set operation finish', operation, this.currentOperation);
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
      this.setOperationStart('join');

      const janusWrapper = new JanusWrapper({
        ...this.janusOptions,
        userId: this.userId,
        debug: process.env.VUE_APP_JANUS_DEBUG === 'true',
      });

      this.janusWrapper = janusWrapper;

      // common events
      janusWrapper.on(JanusWrapper.events.channelJoined, () => {
        this.setOperationFinish('join');
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

      // video events
      janusWrapper.on(JanusWrapper.events.videoPublishersList, this.onVideoPublishersList.bind(this));
      janusWrapper.on(JanusWrapper.events.videoPublisherJoined, this.onVideoPublisherJoined.bind(this));
      janusWrapper.on(JanusWrapper.events.videoPublisherLeft, this.onVideoPublisherLeft.bind(this));
      janusWrapper.on(JanusWrapper.events.localVideoStream, this.onLocalVideoStream.bind(this));
      janusWrapper.on(JanusWrapper.events.videoSlowLink, this.onVideoSlowLink.bind(this));
      janusWrapper.on(JanusWrapper.events.successVideoPublishing, () => {
        this.setOperationFinish('publish');
      });

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
      Object.keys(this.videoPublishers).forEach(key => {
        this.$delete(this.videoPublishers, key);
      });
      this.streamHost.clearAll();
    },

    /**
     * Start sharing video from a camera device
     * @returns {void}
     */
    startSharingCamera() {
      this.setOperationStart('publish');

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
      this.setOperationStart('publish');

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
      this.setOperationStart('unpublish');

      if (!this.janusWrapper) {
        return;
      }

      this.janusWrapper.unpublishVideoStream();
      this.$delete(this.videoPublishers, this.userId);
      this.log('Notify about closing connection for current user', this.userId);
      this.streamHost.closeStreamSharing(this.userId);
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
      console.log('------ onAudioStreamActive');
      if (isActive) {
        if (this.microphone) {
          this.janusWrapper.setMuting(false);
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
      publishers.forEach(publ => this.onVideoPublisherJoined(publ));

      // this.videoPublishers = {};
      // publishers.forEach(publisher => {
      //   // publisher.display - heyka user id
      //   // publisher.id - janus publisher id
      //   this.videoPublishers[publisher.display] = {
      //     userId: publisher.display,
      //     janusId: publisher.id,
      //   };
      // });
      // this.log('Publishers collection is updated', this.videoPublishers);
    },

    /**
     * Handle new publisher, add new publisher to publisher list
     * @param {object} publisher Publicher object
     * @returns {void}
     */
    async onVideoPublisherJoined(publisher) {
      const newPublisher = {
        userId: publisher.display,
        janusId: publisher.id,
      };

      this.log('New publisher is added', newPublisher);
      await new Promise(resolve => setTimeout(resolve, parseInt('500')));
      const stream = await this.janusWrapper.requestVideoStream(publisher.id);

      this.$set(this.videoPublishers, publisher.display, {
        ...newPublisher,
        stream,
      });
      console.log('=================================', this.videoPublishers);
      await new Promise(resolve => this.$nextTick(resolve));

      // Insert stream
      // const el = this.$refs[`video${newPublisher.userId}`][0];

      // el.srcObject = stream;
      // el.onloadedmetadata = function () {
      //   el.play();
      // };
    },

    /**
     * Handle publisher left, remove publisher from publisher list
     * @param {object} publisher Publicher object
     * @returns {void}
     */
    onVideoPublisherLeft(publisher) {
      // if current user unpublished video
      if (publisher.unpublished === 'ok') {
        this.setOperationFinish('unpublish');

        return;
      }

      const key = Object.keys(this.videoPublishers).find(k => this.videoPublishers[k].janusId === publisher.unpublished);

      if (!key) {
        return;
      }
      this.janusWrapper.stopReceivingVideoStream(publisher.unpublished);
      if (this.videoPublishers[key].stream) {
        mediaCapturer.destroyStream(this.videoPublishers[key].stream);
      }
      // Notify StreamSharingHost manager about publisher is left
      this.streamHost.closeStreamSharing(this.videoPublishers[key].userId);

      this.$delete(this.videoPublishers, key);
      // delete this.videoPublishers[key];

      this.log(`Publisher ${key} is deleted`);
    },

    /**
     * Handles requests for publishers stream
     * @param {object} data Request data
     * @param {string} data.userId Which userId are you interested in?
     * @param {string} data.requestId Unique request identifier
     * @returns {void}
     */
    async onRequestStream(data) {
      let publisher = this.videoPublishers[data.userId];
      let tries = 0;

      /**
       * Если паблишер не определён, то скорее всего Янус
       * еще не успел сообщить о начале стрима конкретного пользователя.
       *
       * Пытаемся сделать несколько попыток с небольшим интервалом
       * в надежде, что паблишер появится
       */
      while (!publisher) {
        if (tries > WAIT_PUBLISHER_ATTEMPTS) {
          // попытки кончились, сообщаем о неудаче
          this.streamHost.failedRequest(data.requestId);

          return;
        }
        await new Promise(resolve => setTimeout(resolve, WAIT_PUBLISHER_INVERVAL));
        tries += 1;
        publisher = this.videoPublishers[data.userId];
      }
      this.log(`Stream of ${data.userId} is requested`, data);

      // может стрим уже есть у этого паблишера?
      let stream = publisher.stream;

      // значит запрашиваем стрим у JanusWrapper
      if (!stream) {
        this.log(`Stream for ${data.userId} is not prepared, prepare now`);
        stream = await this.janusWrapper.requestVideoStream(publisher.janusId);
        publisher.stream = stream;
      }

      publisher.requestId = data.requestId;

      this.streamHost.sendStream({
        requestId: publisher.requestId,
        janusId: publisher.janusId,
        userId: data.userId,
      }, stream);
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
      this.$set(this.videoPublishers, this.userId, {
        userId: this.userId,
        stream,
      });

      await new Promise(resolve => this.$nextTick(resolve));

      // Insert stream
      // const el = this.$refs[`video${this.userId}`][0];

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
     * Handle video slow link
     * @param {boolean} uplink - false when all of our packets is not received by Janus, true – some packets lost
     * @returns {void}
     */
    onVideoSlowLink(uplink) {
      connectionCheck.handleSlowInternet(true);
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
