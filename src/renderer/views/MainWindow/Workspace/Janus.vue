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
export default {
  name: 'Janus',
  data() {
    return {
      janus: {
        url: 'http://localhost:8088/janus',
        workspaceToken: 'ba4a0f7a5e91ff278bcffa0e2000977ee40cc901cc75e8a663',
        channelToken: '8126d4768463b7a55bfa6fef2f36c9ffebf832a5815b6591c9',
        audioRoomId: 2749700786267343,
        videoRoomId: 7722212745590146,
      },
      janusWrapper: null,
      userId: 'randomUserId',
    };
  },
  async created() {
    await JanusWrapper.init();
    this.log('JanusWrapper was initialized');
  },
  methods: {
    async selectChannel() {
      const janusWrapper = new JanusWrapper({
        ...this.janus,
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
        this.janusWrapper.__disconnect();
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
};
</script>