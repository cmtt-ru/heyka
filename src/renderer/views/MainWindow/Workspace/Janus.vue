<template>
  <div class="l-p-8">
    Janus
    <button @click="disconnectFromJanus">Disconnect</button>
  </div>
</template>

<script>
import JanusWrapper from '@classes/janusWrapper.js';
export default {
  name: 'Janus',
  async created() {
    await JanusWrapper.init();
    this.log('JanusWrapper was initialized');
  },
  data() {
    return {
      janusWrapper: null,
    };
  },
  methods: {
    disconnectFromJanus() {
      this.janusWrapper.disconnect();
    },
    log() {
      console.log('JANUS.VUE: ', ...arguments);
    },
  },
  async mounted() {
    const janusServerUrl = 'http://localhost:8088/janus';
    const janusAuthToken = '19902a60e5d85949bfbddede461717ee9b0501a3f630302f9a';
    const janusWrapper = new JanusWrapper({
      janusServerUrl,
      janusAuthToken,
      debug: true,
    });

    this.janusWrapper = janusWrapper;

    janusWrapper.on('destroyed', () => {
      this.log('Janus wrapper was destroyed');
    });
    janusWrapper.on('connection-error', (error) => {
      this.log('Connection error', error);
    });

    try {
      await janusWrapper.connect();
    } catch (e) {
      if (e === JanusWrapper.errors.AUTHORIZATION_ERROR) {
        this.log('Handle authorization error');
      } else if (e === JanusWrapper.errors.SERVER_DOWN) {
        this.log('Handle server error');
      } else if (e === JanusWrapper.errors.UNKNOW) {
        this.log('Handle unknow error');
      }
    }
  },
};
</script>