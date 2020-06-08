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
import { mapGetters } from 'vuex';
import broadcastActions from '@classes/broadcastActions';
import commonStreams from '@classes/commonStreams';
import broadcastEvents from '@classes/broadcastEvents';
import UiButton from '@components/UiButton';

export default {
  components: {
    CallControls,
    UiButton,
  },
  computed: {
    ...mapGetters([
      'getUserWhoSharesMedia',
      'amISharingMedia',
      'isAnybodySharingMedia',
      'getSpeakingUser',
    ]),

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

    getUserWhoSharesMedia(user) {
      if (user && this.mediaState.screen === false) {
        this.requestStream(user);
      }
    },

    getSpeakingUserId(userId) {
      if (userId && this.mediaState.screen === false) {
        this.requestStream(userId);
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

    // Если стрим прекратился, но юзер еще шэрит камеру
    // то запрашиваем стрим еще раз
    // самый частый юзкейс - юзер изменил камеру, поэтому стрим обновился
    commonStreams.on('stream-canceled', this.streamCanceledHandler.bind(this));
  },
  destroyed() {
    commonStreams.removeAllListeners('stream-canceled');
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

    /**
     * Show grid handler
     * @returns {void}
     */
    showGridHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid');
    },

    /**
     * Stream canceled handler
     * @param {string} userId – user id
     * @returns {Promise<void>}
     */
    async streamCanceledHandler(userId) {
      if (!this.selectedChannelId) {
        return;
      }
      if (this.getUserWhoSharesMedia === userId) {
        this.requestStream(userId);
      }
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
