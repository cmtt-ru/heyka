<template>
  <div class="l-p-8">
    <br />
    Janus
    <br />
    <button @click="selectChannel">Select channel</button>
    <br />
    <button @click="unselectChannel">Unselect channel</button>
    <br />
    <audio ref="audio" autoplay />
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
    };
  },
  computed: {
    ...mapState('janus', {
      janusOptions: state => state,
    }),
    ...mapState('me', {
      selectedChannelId: 'selectedChannelId',
      userId: 'id',
    }),
  },
  async created() {
    await JanusWrapper.init();
    this.log('JanusWrapper was initialized');
  },
  methods: {
    async selectChannel() {
      const janusWrapper = new JanusWrapper({
        ...this.janusOptions,
        userId: this.userId,
        debug: true,
      });

      this.janusWrapper = janusWrapper;

      janusWrapper.on('connection-error', this.onConnectionError.bind(this));
      janusWrapper.on('remote-audio-stream', this.onRemoteAudioStream.bind(this));

      await janusWrapper.join();
    },
    unselectChannel() {
      if (this.janusWrapper) {
        this.janusWrapper.disconnect();
        this.janusWrapper = null;
      }
    },
    onRemoteAudioStream(stream) {
      this.log('Attach audio stream to the audio element');
      JanusWrapper.attachMediaStream(this.$refs.audio, stream);
    },
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
    log() {
      console.log('JANUS.VUE: ', ...arguments);
    },
  },
  watch: {
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
  },
};
</script>