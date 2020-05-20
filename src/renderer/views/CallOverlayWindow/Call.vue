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
import StreamReceiver from '@classes/StreamSharing/Receiver';
import { mapGetters } from 'vuex';
import broadcastActions from '@classes/broadcastActions';

export default {
  components: {
    CallControls,
  },
  data() {
    return {
      streamReceiver: null,
      watchForUserId: null,
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
        this.streamReceiver.requestStream(user.id);
      }
    },
  },
  created() {
    this.streamReceiver = new StreamReceiver();
    this.streamReceiver.on('new-stream', data => {
      this.$refs.video.srcObject = data.video;
    });
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
