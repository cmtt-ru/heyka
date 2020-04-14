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
        workspaceToken: '4e9ba3c0ef6367ccde8a5e2f730486d818ee64d0b2f43f2b3e',
        channelToken: 'd14cdb7799217049f5555af82fe749328bda9ae0bcc30fc708',
        audioRoomId: 698975104980057,
        videoRoomId: 4163988414424622,
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

      janusWrapper.on('connection-error', errorCode => {
        this.log(`Connection error: ${errorCode}`);
      });

      janusWrapper.on('remote-audio-stream', stream => {
        this.log('Attach audio stream to audio element');
        JanusWrapper.attachMediaStream(this.$refs.audio, stream);
      });

      await janusWrapper.join();
    },
    unselectChannel() {
      if (this.janusWrapper) {
        this.janusWrapper.__disconnect();
        this.janusWrapper = null;
      }
    },
    log() {
      console.log('JANUS.VUE: ', ...arguments);
    },
  },
};
</script>