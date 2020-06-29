<template>
  <div class="call-window">
    <div
      v-if="isMediaSharing"
      class="call-window__media"
      @dblclick="expandHandler"
    >
      <video ref="video" />

      <ui-button
        class="call-window__media__expand"
        :type="7"
        size="medium"
        icon="fullscreen"
        @click="expandHandler"
      />
    </div>

    <call-controls
      :row="isMediaSharing"
      :buttons="['screen', 'camera', 'microphone', 'grid', 'leave']"
    />
  </div>
</template>

<script>
import CallControls from './CallControls';
import { mapGetters, mapState } from 'vuex';
import broadcastActions from '@classes/broadcastActions';
import broadcastEvents from '@classes/broadcastEvents';
import UiButton from '@components/UiButton';
import janusVideoroomWrapper from '../../classes/janusVideoroomWrapper';

export default {
  components: {
    CallControls,
    UiButton,
  },
  computed: {
    ...mapState({
      janusOptions: 'janus',
      selectedDevices: 'app/selectedDevices',
    }),
    ...mapGetters([
      'getUserWhoSharesMedia',
      'getUsersWhoShareMedia',
      'amISharingMedia',
      'isAnybodySharingMedia',
      'getSpeakingUser',
    ]),
    ...mapGetters({
      myId: 'me/getMyId',
    }),

    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    isMediaSharing() {
      return this.isAnybodySharingMedia && !this.amISharingMedia;
    },

    selectedChannelId() {
      return this.$store.state.me.selectedChannelId;
    },

    getSpeakingUserId() {
      if (this.getSpeakingUser) {
        return this.getSpeakingUser.id;
      }

      return false;
    },
  },

  watch: {
    isMediaSharing() {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    },

    selectedChannelId(newChannelId, oldChannelId) {
      if (!newChannelId && oldChannelId) {
        janusVideoroomWrapper.leave();
      }
      if (newChannelId) {
        janusVideoroomWrapper.join(this.myId, this.janusOptions);
      }
    },

    'mediaState.screen'(state) {
      console.log('here');
      if (state) {
        janusVideoroomWrapper.publishVideoStream('screen', this.janusOptions.sharingSource.id);
      } else {
        janusVideoroomWrapper.unpublishVideoStream();
      }
    },

    selectedCamera(deviceId) {

    },
  },

  async created() {
    if (this.isMediaSharing) {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    }
    await janusVideoroomWrapper.init();
    if (this.selectedChannelId) {
      await janusVideoroomWrapper.join(this.myId, this.janusOptions);
    }
  },
  destroyed() {

  },
  methods: {

    /**
     * Show grid handler
     * @returns {void}
     */
    showGridHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid');
    },

    /**
     * Expand click handler
     * @returns {void}
     */
    expandHandler() {
      if (this.getUserWhoSharesMedia) {
        broadcastActions.dispatch('openGrid');
        broadcastEvents.dispatch('grid-expand', this.getSpeakingUserId);
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
      position relative
      flex-grow 1

      video
        display block
        width 100%
        height 213px
        object-fit cover

      &__expand
        position absolute
        bottom 8px
        right 8px
        transition opacity 0.15s ease
        opacity 0

    &:hover
      .call-window__media__expand
        opacity 1

</style>
