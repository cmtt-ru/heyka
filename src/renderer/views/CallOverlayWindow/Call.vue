<template>
  <div class="call-window">
    <div
      v-show="isMediaSharing"
      class="call-window__media"
      @dblclick="expandHandler"
    >
      <video ref="video" />
      <div
        class="call-window__media__expand"
        @click="expandHandler"
      >
        <ui-button
          v-if="!isMyMedia"
          :type="7"
          size="medium"
          icon="fullscreen"
          @click="expandHandler"
        />
      </div>
    </div>

    <call-controls
      :row="isMediaSharing"
      :buttons="['screen', 'camera', 'microphone', 'grid', 'leave']"
    />
  </div>
</template>

<script>
import captureFrame from 'capture-frame';
import CallControls from '@sdk/views/Call/CallControls';
import { mapGetters, mapState } from 'vuex';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import UiButton from '@components/UiButton';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';

export default {
  components: {
    CallControls,
    UiButton,
  },
  data() {
    return {
      videoRoomState: 'closed',
      isMyMedia: false,
    };
  },
  computed: {
    ...mapState({
      janusOptions: 'janus',
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
      return this.isAnybodySharingMedia && !this.mediaState.screen;
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
    janusVideoroomWrapper.on('single-sub-stream', stream => this.insertStream(stream));
    janusVideoroomWrapper.on('publisher-joined', this.onNewPublisher.bind(this));
  },
  beforeDestroy() {
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

      let publisher = janusVideoroomWrapper.getActivePublishers().find(p => p.userId === userId);

      if (!publisher) {
        publisher = janusVideoroomWrapper.getActivePublishers()[0];
      }

      if (!publisher) {
        return;
      }

      const currentFeed = janusVideoroomWrapper.currentSingleSubscriptionFeed();

      const currentPublisher = janusVideoroomWrapper.getActivePublishers().find(p => p.janusId === currentFeed);

      if (currentPublisher) {
        this.isMyMedia = currentPublisher.userId === this.myId;
      }

      if (currentFeed === publisher.janusId) {
        return;
      }

      this.switchToFeed(publisher.janusId);
    },

    /**
     * Switch single subscription to specific feed
     * @param {number} janusId Janus user id (feed)
     * @returns {void}
     */
    switchToFeed(janusId) {
      const currentFeed = janusVideoroomWrapper.currentSingleSubscriptionFeed();

      if (this.videoRoomState === 'closed' || (this.videoRoomState === 'ready' && !currentFeed)) {
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
        broadcastEvents.removeAllListeners('grid-expanded-ready');
        /** Wait until expanded grid appears and send video frame */
        broadcastEvents.once('grid-expanded-ready', () => {
          broadcastEvents.dispatch('grid-expanded-set-video-frame', this.getFrameFromVideo());
        });

        broadcastActions.dispatch('openGrid', this.getUserWhoSharesMedia);
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
    async insertStream(stream) {
      const el = this.$refs.video;

      el.srcObject = stream;
      el.onloadedmetadata = () => {
        el.play();
      };
    },

    /**
     * Get frame from video
     * @returns {string}
     */
    getFrameFromVideo() {
      const frameBuffer = captureFrame(this.$refs.video, 'jpeg');

      return 'data:image/jpeg;base64,' + frameBuffer.toString('base64');
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
        bottom 0px
        right 0px
        padding 32px 8px 8px 24px
        cursor pointer
        -webkit-app-region no-drag

.close-button
  position absolute
  top 0
  right 0
  border-radius 0

</style>
