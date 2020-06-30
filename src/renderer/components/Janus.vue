<template>
  <div>
    <audio
      ref="audio"
      autoplay
      muted
    />
    <!--    <video-->
    <!--      v-for="publisher in videoPublishers"-->
    <!--      :key="publisher.userId"-->
    <!--      :ref="`video${publisher.userId}`"-->
    <!--      style="width: 100px; height: 80px"-->
    <!--    />-->
  </div>
</template>

<script>
import JanusWrapper from '@classes/JanusWrapper.js';
import StreamHost from '@classes/StreamSharing/Host';
import mediaCapturer from '@classes/mediaCapturer';
import connectionCheck from '@classes/connectionCheck';
import AudioCheck from '@classes/AudioCheck';
import { mapState } from 'vuex';
import Logger from '@classes/logger';

const cnsl = new Logger('Janus.vue', '#AF7AC5 ');
const WAIT_PUBLISHER_INVERVAL = 80;
const WAIT_PUBLISHER_ATTEMPTS = 20;

/**
 * Video publishers
 * @type {object}
 */
const videoPublishers = {};

/**
 * Stream host instance
 * @type {object}
 */
let streamHost = null;

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
      screen: state => state.mediaState.screen,
      camera: state => state.mediaState.camera,
    }),
    ...mapState([ 'isSocketConnected' ]),
    ...mapState('app', {
      selectedCameraDevice: state => state.selectedDevices.camera,
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
        cnsl.log('Channel unselect');
        this.unselectChannel();
      }
      if (id !== null) {
        cnsl.log('Channel select');
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
      cnsl.log(`Set muting of speakers ${!state}`);
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

    selectedCameraDevice(deviceId) {
      if (janusWrapper && this.camera) {
        janusWrapper.setCameraDevice(deviceId);
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
    streamHost = new StreamHost();
    streamHost.on('request-stream', this.onRequestStream.bind(this));
    cnsl.log('JanusWrapper was initialized');
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
      cnsl.info('setOperationStart', operation);
    },
    setOperationFinish(operation) {
      cnsl.info('setOperationFinish', operation);
      if (operation === this.currentOperation) {
        this.$store.dispatch('janus/setInProgress', false);
        cnsl.log(this.$store.state.janus);
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

      janusWrapper = new JanusWrapper({
        ...this.janusOptions,
        microphoneDeviceId: this.selectedMicrophoneDevice,
        userId: this.userId,
        debug: process.env.VUE_APP_JANUS_DEBUG === 'true',
      });

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
      janusWrapper.on(JanusWrapper.events.webrtcCleanUp, this.onWebrtcCleanUp.bind(this));
      janusWrapper.on(JanusWrapper.events.successVideoPublishing, () => {
        this.setOperationFinish('publish');
      });

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
     * Start sharing video from a camera device
     * @returns {void}
     */
    startSharingCamera() {
      if (!janusWrapper) {
        cnsl.error('Janus wrapper does not exist');

        return;
      }

      this.setOperationStart('publish');

      janusWrapper.publishVideoStream('camera', this.selectedCameraDevice);
    },

    /**
     * Start sharing video from the screen
     * @returns {void}
     */
    startSharingScreen() {
      if (!janusWrapper) {
        cnsl.error('Janus wrapper does not exist');

        return;
      }

      this.setOperationStart('publish');

      janusWrapper.publishVideoStream('screen', this.janusOptions.sharingSource.id);
    },

    /**
     * Stop sharing any video
     * @returns {void}
     */
    stopSharingVideo() {
      if (!janusWrapper) {
        return;
      }

      if (!janusWrapper.__videoroomPlugin) {
        return;
      }

      this.setOperationStart('unpublish');

      janusWrapper.unpublishVideoStream();
      this.$delete(videoPublishers, this.userId);
      cnsl.log('Notify about closing connection for current user', this.userId);
      streamHost.closeStreamSharing(this.userId);
    },

    /**
     * Handles remote audio stream
     * @param {object} stream remote audio stream
     * @returns {void}
     */
    onRemoteAudioStream(stream) {
      cnsl.log('Attach audio stream to the audio element');
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
          cnsl.error('Janus server is down');
          break;
        case JanusWrapper.errors.AUTHENTICATION_ERROR:
          cnsl.error('Janus authentication error');
          break;
        case JanusWrapper.errors.UNKNOW:
          cnsl.error('An unknow error');
          break;
      }
    },

    /**
     * Handles event when media connection activity is changed
     * @param {boolean} isActive Is media connection active
     * @returns {void}
     */
    onAudioStreamActive(isActive) {
      cnsl.log('onAudioStreamActive');
      if (isActive) {
        if (this.microphone) {
          janusWrapper.setMuting(false);
          cnsl.log('setMuting false');
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
     * Handle new publisher list, set new object of publishers
     * @param {array} publishers List of publishers
     * @returns {void}
     */
    onVideoPublishersList(publishers) {
      publishers.forEach(publ => this.onVideoPublisherJoined(publ));

      // videoPublishers = {};
      // publishers.forEach(publisher => {
      //   // publisher.display - heyka user id
      //   // publisher.id - janus publisher id
      //   videoPublishers[publisher.display] = {
      //     userId: publisher.display,
      //     janusId: publisher.id,
      //   };
      // });
      // cnsl.log('Publishers collection is updated', videoPublishers);
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

      cnsl.log('New publisher is added', newPublisher);
      await new Promise(resolve => setTimeout(resolve, parseInt('500')));
      const stream = await janusWrapper.requestVideoStream(publisher.id);

      videoPublishers[publisher.display] = {
        ...newPublisher,
        stream,
      };
      cnsl.log('=================================', videoPublishers);
      await new Promise(resolve => this.$nextTick(resolve));

      // Insert stream
      // const el = this.$refs[`video${newPublisher.userId}`][0];
      //
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
        return;
      }

      const key = Object.keys(videoPublishers).find(k => videoPublishers[k].janusId === publisher.unpublished);

      if (!key) {
        return;
      }
      janusWrapper.stopReceivingVideoStream(publisher.unpublished);
      if (videoPublishers[key].stream) {
        mediaCapturer.destroyStream(videoPublishers[key].stream);
      }
      // Notify StreamSharingHost manager about publisher is left
      streamHost.closeStreamSharing(videoPublishers[key].userId);

      delete videoPublishers[key];
      // delete videoPublishers[key];

      cnsl.log(`Publisher ${key} is deleted`);
    },

    /**
     * Handles requests for publishers stream
     * @param {object} data Request data
     * @param {string} data.userId Which userId are you interested in?
     * @param {string} data.requestId Unique request identifier
     * @returns {void}
     */
    async onRequestStream(data) {
      let publisher = videoPublishers[data.userId];
      let tries = 0;

      /**
       * Если паблишер не определён, то скорее всего Янус
       * еще не успел сообщить о начале стрима конкретного пользователя.
       *
       * Пытаемся сделать несколько попыток с небольшим интервалом
       * в надежде, что паблишер появится
       */
      console.log('-------- WAITING PUBLISHER');
      while (!publisher) {
        if (tries > WAIT_PUBLISHER_ATTEMPTS) {
          // попытки кончились, сообщаем о неудаче
          console.log('-------- FAILED REQUEST');
          streamHost.failedRequest(data.requestId);

          return;
        }
        await new Promise(resolve => setTimeout(resolve, WAIT_PUBLISHER_INVERVAL));
        tries += 1;
        publisher = videoPublishers[data.userId];
      }
      cnsl.log(`Stream of ${data.userId} is requested`, data);

      // может стрим уже есть у этого паблишера?
      let stream = publisher.stream;

      // значит запрашиваем стрим у JanusWrapper
      if (!stream) {
        cnsl.log(`Stream for ${data.userId} is not prepared, prepare now`);
        stream = await janusWrapper.requestVideoStream(publisher.janusId);
        publisher.stream = stream;
      }

      publisher.requestId = data.requestId;

      streamHost.sendStream({
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
     * Handle video slow link
     * @param {boolean} uplink - false when all of our packets is not received by Janus, true – some packets lost
     * @returns {void}
     */
    onVideoSlowLink(uplink) {
      connectionCheck.handleSlowInternet(true);
    },

    /**
     * Handle webrtc clean up
     * @returns {void}
     */
    onWebrtcCleanUp() {
      this.setOperationFinish('unpublish');
      this.$store.dispatch('janus/setInProgress', false);
    },

    /**
     * Internal log function
     * @returns {void}
     */
    log() {
      cnsl.log('JANUS.VUE: ', ...arguments);
    },
  },
};
</script>
