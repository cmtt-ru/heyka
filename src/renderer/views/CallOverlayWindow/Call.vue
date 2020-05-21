<template>
  <div class="call-window">
    <div
      v-if="isMediaSharing"
      class="call-window__media"
    >
      <video ref="video" />
    </div>

    <call-controls
      :row="isMediaSharing"
      :buttons="['screen', 'camera', 'microphone', 'grid', 'leave']"
    />
  </div>
</template>

<script>
import CallControls from './CallControls';
import { mapGetters } from 'vuex';
import broadcastActions from '@classes/broadcastActions';
import commonStreams from '@classes/commonStreams';

export default {
  components: {
    CallControls,
  },
  data() {
    return {
      streamReceiver: null,
    };
  },
  computed: {
    ...mapGetters([
      'getUserWhoSharesMedia',
      'amISharingMedia',
      'isAnybodySharingMedia',
    ]),

    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    isMediaSharing() {
      return this.isAnybodySharingMedia && !this.amISharingMedia;
    },
  },

  watch: {
    isMediaSharing() {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    },
    getUserWhoSharesMedia(user) {
      if (user) {
        this.requestStream(user);
      }
    },
  },
  created() {
    if (this.isMediaSharing) {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    }
    if (this.getUserWhoSharesMedia) {
      this.requestStream(this.getUserWhoSharesMedia);
    }
  },
  methods: {
    async requestStream(user) {
      const stream = await commonStreams.getStream(user);
      const htmlElement = this.$refs.video;

      if (htmlElement) {
        htmlElement.srcObject = stream;
        htmlElement.onloadedmetadata = function () {
          htmlElement.play();
        };
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column

    &__media
      flex-grow 1

      video
        display block
        width 100%
        height 100%
        background #333

</style>
