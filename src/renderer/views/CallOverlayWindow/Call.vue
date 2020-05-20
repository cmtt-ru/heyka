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
  methods: {
    userInChannelWithVideo() {
      return this.getUsersByChannel(this.$store.state.me.selectedChannelId)
        .filter(u => (u.userMediaState ? u.userMediaState.screen || u.userMediaState.camera : false) && u.id !== this.$store.state.me.id);
    },
  },
  computed: {
    ...mapGetters([ 'getUsersByChannel' ]),
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
      console.log('users in channels is updated', newUsers);
    },
  },
  created() {
    this.streamReceiver = new StreamReceiver();
    this.streamReceiver.on('new-stream', data => {
      this.$refs.video.srcObject = data.video;
    });
    const magicNumber = 500;

    setInterval(() => {
      const users = this.userInChannelWithVideo();

      if (users.length > 0) {
        this.currentUserVideo = users[0];
      }
    }, magicNumber);
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
