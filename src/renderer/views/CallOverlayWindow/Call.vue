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
  data() {
    return {
      videoRoomState: 'closed',
    };
  },
  computed: {
    ...mapState({
      janusOptions: 'janus',
      selectedDevices: 'app/selectedDevices',
    }),
    ...mapGetters({
      getUserWhoSharesMedia: 'getUserWhoSharesMedia',
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      amISharingMedia: 'amISharingMedia',
      isAnybodySharingMedia: 'isAnybodySharingMedia',
      getSpeakingUser: 'getSpeakingUser',
      mediaState: 'me/getMediaState',
      selectedChannelId: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
    }),

    isMediaSharing() {
      return this.isAnybodySharingMedia && !this.amISharingMedia;
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

    getUserWhoSharesMedia(userId) {
      this.loadCurrentVideo();
    },

    videoRoomState(info) {
      console.log('videoroom state: ', info);
    },
  },

  async created() {
    console.log('created');
    if (this.isMediaSharing) {
      broadcastActions.dispatch('me/setMediaSharingMode', this.isMediaSharing);
    }

    janusVideoroomWrapper.on('joined', this.onSingleSubscriptionReady.bind(this));
    janusVideoroomWrapper.on('switched', this.onSingleSubscriptionReady.bind(this));
    janusVideoroomWrapper.on('paused', this.onSingleSubscriptionReady.bind(this));
    janusVideoroomWrapper.on('started', this.onSingleSubscriptionReady.bind(this));

    janusVideoroomWrapper.on('cleanup', () => {
      this.videoRoomState = 'closed';

      this.loadCurrentVideo();
    });

    await janusVideoroomWrapper.init();
    if (this.selectedChannelId) {
      this.videoRoomState = 'joining';
      await janusVideoroomWrapper.join(this.myId, this.janusOptions);
    }
  },
  mounted() {
    console.log('mounted');
    if (this.getUserWhoSharesMedia) {
      this.watchingUser = this.getUserWhoSharesMedia;
    }
    janusVideoroomWrapper.on('single-sub-stream', stream => this.insertStream(stream));
    janusVideoroomWrapper.on('publisher-joined', this.onNewPublisher.bind(this));
  },
  beforeDestroy() {
    console.log('beforeDestroy');
    janusVideoroomWrapper.removeAllListeners('single-sub-stream');
    janusVideoroomWrapper.removeAllListeners('publisher-joined');
  },
  destroyed() {

  },
  methods: {
    /**
     * Loads user video of current user if it possible
     * @param {string} userId User id
     * @returns {void}
     */
    loadCurrentVideo() {
      const userId = this.getUserWhoSharesMedia;
      const publisher = janusVideoroomWrapper.getActivePublishers().find(p => p.userId === userId);

      if (!publisher) {
        return;
      }

      const currentFeed = janusVideoroomWrapper.currentSingleSubscriptionFeed();

      if (currentFeed === publisher.janusId) {
        return;
      }

      this.switchToFeed(publisher.userId);
    },

    /**
     * Switch single subscription to specific feed
     * @param {number} janusId Janus user id (feed)
     * @returns {void}
     */
    switchToFeed(janusId) {
      if (this.videoRoomState === 'closed') {
        this.videoRoomState = 'starting';
        janusVideoroomWrapper.createSingleSubscription(janusId);
      } else if (this.videoRoomState === 'ready') {
        this.videoRoomState = 'switching';
        janusVideoroomWrapper.switchSingleSubscription(janusId);
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
     * Expand click handler
     * @returns {void}
     */
    expandHandler() {
      if (this.getUserWhoSharesMedia) {
        broadcastActions.dispatch('openGrid');
        broadcastEvents.dispatch('grid-expand', this.getSpeakingUserId);
      }
    },

    /**
     * Handles new publisher
     * @param {object} publisher Publisher object
     * @param {number} publisher.janusId Publisher janus id
     * @param {string} publisher.userId Publisher user id (heyka)
     * @returns {void}
     */
    onNewPublisher(publisher) {
      this.loadCurrentVideo();
    },

    /**
     * Handles when single subscription is ready for working
     * @returns {void}
     */
    onSingleSubscriptionReady() {
      this.videoRoomState = 'ready';
      this.loadCurrentVideo();
    },

    /**
     * Insert video stream in html
     * @param {MediaStream} stream Video stream
     * @returns {void}
     */
    insertStream(stream) {
      const el = this.$refs.video;

      el.srcObject = stream;
      el.onloadedmetadata = () => {
        el.play();
      };
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
