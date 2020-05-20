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

export default {
  components: {
    CallControls,
  },
  data() {
    return {
      streamReceiver: null,
      currentUserVideo: null,
    };
  },
  computed: {
    ...mapGetters([ 'getUsersByChannel' ]),
    userInChannelWithVideo() {
      return this.getUsersByChannel(this.$store.state.me.selectedChannelId)
        .filter(u => (u.userMediaState ? u.userMediaState.camera || u.userMediaState.screen : false) && u.id !== this.$store.state.me.id);
    },
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    isMediaSharing() {
      return false;
      // return this.mediaState.screen || this.mediaState.camera;
    },
  },
  watch: {
    currentUserVideo(userId) {
      console.log('new current user video: ', userId);
      this.streamReceiver.requestStream(userId);
    },
    usersInChannelWithVideo(newUsers) {
      if (newUsers.length === 0) {
        return;
      }
      if (this.currentUserVideo !== newUsers[0]) {
        this.currentUserVideo = newUsers[0];
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
