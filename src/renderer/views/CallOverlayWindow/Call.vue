<template>
  <div class="call-window">
    <div
      v-show="isLocalMediaSharing"
      class="call-window__media"
      @dblclick="expandHandler"
    >
      <video
        ref="preloader"
        :src="preloaderSrc"
        class="call-window__media__preloader"
        :class="{'call-window__media__preloader--hidden': !preloaderShown}"
      />
      <video
        ref="video"
        class="call-window__media__video"
      />
      <div
        v-if="sharingUser"
        class="sharing-user"
      >
        <avatar
          class="sharing-user__avatar"
          :image="userAvatar(sharingUser.id, 12)"
          :user-id="sharingUser.id"
          :size="12"
        />
        <div>
          {{ sharingUser.name }}
        </div>
      </div>
      <div
        v-if="!isMyMedia"
        class="call-window__media__expand"
        @click="expandHandler"
      >
        <ui-button
          :type="7"
          square
          popover
          class="call-window__media__expand__button"
          :height="44"
          size="medium"
          icon="fullscreen"
          @click="expandHandler"
        />
      </div>
    </div>

    <call-controls
      :row="isLocalMediaSharing"
      :buttons="buttonsSetup"
      class="call-window__controls"
    />

    <div
      v-if="isLocalMediaSharing"
    >
      <div class="resize-border resize-border--top" />
      <div class="resize-border resize-border--left" />
      <div class="resize-border resize-border--right" />
      <div class="resize-border resize-border--bottom" />
    </div>
  </div>
</template>

<script>
import captureFrame from 'capture-frame';
import CallControls from '@sdk/views/Call/CallControls';
import { mapGetters, mapState } from 'vuex';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';

const BUTTON_SETUPS = {
  default: ['screen', 'camera', 'microphone', 'grid', 'leave'],
  streaming: ['screen', 'microphone', 'drawing', 'grid', 'leave'],
};

export default {
  components: {
    CallControls,
    UiButton,
    Avatar,
  },
  data() {
    return {
      videoRoomState: 'closed',
      isMyMedia: false,
      preloaderSrc: null,
      preloaderShown: false,
      channelSwitchedTs: Date.now(),
      streamingOverlayExpanded: false,
      isMediaPlaying: false,
    };
  },
  computed: {
    ...mapState({
      janusOptions: 'janus',
    }),
    ...mapGetters({
      getUserWhoSharesMedia: 'getUserWhoSharesMedia',
      getUsersWhoShareMedia: 'getUsersWhoShareMedia',
      getUsersWhoShareScreen: 'getUsersWhoShareScreen',
      amISharingScreen: 'amISharingScreen',
      isAnybodySharingMedia: 'isAnybodySharingMedia',
      getSpeakingUser: 'getSpeakingUser',
      mediaState: 'me/getMediaState',
      selectedChannelId: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
      userAvatar: 'users/getUserAvatarUrl',
    }),

    amIStreaming() {
      return this.$store.state.me.mediaState.screen;
    },

    buttonsSetup() {
      if (this.amIStreaming) {
        return BUTTON_SETUPS.streaming;
      }

      return BUTTON_SETUPS.default;
    },

    /**
     * That value depends on local media state
     * In order to changing overlay size just after media state changes
     * @returns {boolean}
     */
    isLocalMediaSharing() {
      return this.isAnybodySharingMedia && !this.amIStreaming;
    },

    /**
     * That value depends on store in order to
     * process videostreaming only after backend response
     * @returns {boolean}
     */
    isGlobalMediaSharing() {
      return this.isAnybodySharingMedia && !this.amISharingScreen;
    },

    getSpeakingUserId() {
      if (this.getSpeakingUser) {
        return this.getSpeakingUser.id;
      }

      return false;
    },

    sharingUser() {
      return this.$store.getters['users/getUserById'](this.getUserWhoSharesMedia);
    },

    isNeedToShowPreloader() {
      return !this.isMediaPlaying && this.isLocalMediaSharing;
    },
  },

  watch: {
    isLocalMediaSharing(value) {
      broadcastActions.dispatch('me/setMediaSharingMode', value);
    },

    isGlobalMediaSharing(value) {
      console.log('globalmediasharing === ', value);
      if (value && this.videoRoomState === 'closed') {
        this.initJanusConnection();
      } else if (!value) {
        this.destroyJanusConnection();
      }
    },

    async selectedChannelId(newChannelId, oldChannelId) {
      this.channelSwitchedTs = Date.now();

      if (newChannelId && this.videoRoomState === 'closed') {
        this.initJanusConnection();
      } else if (!newChannelId && this.videoRoomState !== 'closed') {
        this.destroyJanusConnection();
      } else if (newChannelId && oldChannelId && this.videoRoomState === 'ready') {
        await this.destroyJanusConnection();
        this.initJanusConnection();
      }
    },

    getUserWhoSharesMedia(userId) {
      this.loadCurrentVideo();
    },

    videoRoomState(info) {
      console.log('videoroom state: ', info);
    },

    isNeedToShowPreloader(val) {
      this.showPreloader(val);
    },
  },

  async mounted() {
    await janusVideoroomWrapper.init();

    if (this.isLocalMediaSharing) {
      this.initJanusConnection();
    }

    this.showPreloader(this.isLocalMediaSharing);

    this.preloaderSrc = (await import(/* webpackChunkName: "video" */ '@assets/mp4/video-preloader.mp4')).default;

    this.$refs.video.addEventListener('loadedmetadata', () => {
      this.isMediaPlaying = true;
    }, false);

    this.$refs.video.addEventListener('abort', () => {
      this.isMediaPlaying = false;
    }, false);

    this.$refs.video.addEventListener('suspend', () => {
      this.isMediaPlaying = false;
    }, false);
  },

  beforeDestroy() {
    janusVideoroomWrapper.removeAllListeners('single-sub-stream');
    janusVideoroomWrapper.removeAllListeners('publisher-joined');
  },

  destroyed() {

  },

  methods: {
    /**
     * Init janus connection in videoroom wrapper
     * @returns {void}
     */
    async initJanusConnection() {
      janusVideoroomWrapper.on('joined', this.onSingleSubscriptionReady.bind(this));
      janusVideoroomWrapper.on('switched', this.onSingleSubscriptionReady.bind(this));
      janusVideoroomWrapper.on('paused', this.onSingleSubscriptionReady.bind(this));
      janusVideoroomWrapper.on('started', this.onSingleSubscriptionReady.bind(this));
      janusVideoroomWrapper.on('unauthorized-request', async () => {
        this.videoRoomState = 'closed';
        await this.destroyJanusConnection();
        this.initJanusConnection();
      });
      janusVideoroomWrapper.on('single-sub-stream', stream => this.insertStream(stream));
      janusVideoroomWrapper.on('publisher-joined', this.onNewPublisher.bind(this));

      janusVideoroomWrapper.on('cleanup', () => {
        this.videoRoomState = 'closed';

        this.loadCurrentVideo();
      });

      if (this.selectedChannelId) {
        this.videoRoomState = 'joining';
        await janusVideoroomWrapper.join(this.myId, { ...this.janusOptions });
      }
    },

    /**
     * Destroy janus connection in videoroom wrapper
     * @returns {void}
     */
    async destroyJanusConnection() {
      janusVideoroomWrapper.removeAllListeners('single-sub-stream');
      janusVideoroomWrapper.removeAllListeners('publisher-joined');
      janusVideoroomWrapper.removeAllListeners('joined');
      janusVideoroomWrapper.removeAllListeners('switched');
      janusVideoroomWrapper.removeAllListeners('paused');
      janusVideoroomWrapper.removeAllListeners('started');
      janusVideoroomWrapper.removeAllListeners('cleanup');
      janusVideoroomWrapper.removeAllListeners('unauthorized-request');

      await janusVideoroomWrapper.leave();

      this.videoRoomState = 'closed';
    },

    /**
     * Loads user video of current user if it possible
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
      if (this.isLocalMediaSharing) {
        this.loadCurrentVideo();
      }
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

    /**
     * Show or hide video preloader
     * @param {boolean} state – state
     * @returns {string}
     */
    showPreloader(state = true) {
      if (this.$refs.preloader) {
        if (state === true) {
          this.$refs.preloader.currentTime = 0;
          this.$refs.preloader.play();

          this.$refs.preloader.onended = () => {
            this.$refs.preloader.currentTime = 1.5;
            this.$refs.preloader.play();
          };
        } else {
          this.$refs.preloader.ontransitionend = () => {
            this.$refs.preloader.pause();
            this.$refs.preloader.ontransitionend = null;
            this.$refs.preloader.onended = null;
          };
        }

        this.preloaderShown = state;
      }
    },

    streamingHandler() {
      this.streamingOverlayExpanded = !this.streamingOverlayExpanded;
      broadcastEvents.dispatch('hover-streaming-panel', this.streamingOverlayExpanded);
    },

  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column
    height 100vh

    &__media
      position relative
      flex-grow 2
      flex-shrink 2
      min-height 196px

      video
        display block
        width 100%
        height 100%
        object-fit cover
        background-color #000000

      &__preloader
        position absolute
        z-index 1
        background var(--app-bg)
        opacity 1

        &--hidden
          transition opacity 2s ease
          opacity 0

      &__expand
        position absolute
        bottom 0
        right 0
        padding 32px 12px 12px 24px
        cursor pointer
        -webkit-app-region no-drag
        z-index 2

        &__button
          border-radius 11px

    &__controls
      flex-grow 0
      flex-shrink 0

.close-button
  position absolute
  top 0
  right 0
  border-radius 0

.sharing-user
  position absolute
  top 12px
  left 12px
  display flex
  flex-direction row
  background-color #000000
  padding 4px
  border-radius 4px
  font-size 12px
  line-height 12px
  align-items center

  &__avatar
    margin-right 4px

.resize-border
  position absolute
  width 100%
  height 6px
  z-index 5
  opacity 0
  -webkit-app-region no-drag

  &--top
    top 0
    right 0
    left 0

  &--bottom
    bottom 0
    right 0
    left 0

  &--left
    top 0
    bottom 0
    left 0
    width 6px
    height 100%

  &--right
    top 0
    right 0
    bottom 0
    width 6px
    height 100%
</style>
