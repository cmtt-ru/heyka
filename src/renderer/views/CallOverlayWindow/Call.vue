<template>
  <div class="call-window">
    <div
      v-show="mediaCanShow"
      class="call-window__media"
      @dblclick="expandHandler"
    >
      <!--      <video-->
      <!--        ref="preloader"-->
      <!--        :src="preloaderSrc"-->
      <!--        class="call-window__media__preloader"-->
      <!--        :class="{'call-window__media__preloader&#45;&#45;hidden': !preloaderShown}"-->
      <!--      />-->
      <zoom-pan style="height: 100%">
        <video
          ref="video"
          class="call-window__media__video"
          autoplay
          muted
        />
      </zoom-pan>
      <div
        v-if="sharingUser"
        class="sharing-user"
      >
        <avatar
          class="sharing-user__avatar"
          :user-id="sharingUser.user.id"
          :size="12"
        />
        <div>
          {{ sharingUser.user.name }}
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
        />
      </div>
    </div>

    <call-controls
      :row="mediaCanShow"
      :buttons="['screen', 'camera', 'microphone', 'grid', 'leave']"
      class="call-window__controls"
    />

    <div
      v-if="mediaCanShow"
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
import ZoomPan from '@components/ZoomPan';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import * as linkify from 'linkifyjs';
import xss from 'xss';
import Mousetrap from 'mousetrap';

const MUST_PLAY_TIMEOUT = 3000;
let mustPlayTimer = null;

export default {
  components: {
    CallControls,
    UiButton,
    Avatar,
    ZoomPan,
  },
  data() {
    return {
      videoRoomState: 'closed',
      isMyMedia: false,
      // preloaderSrc: null,
      preloaderShown: false,
      channelSwitchedTs: Date.now(),
      streamingOverlayExpanded: false,
      isMediaPlaying: false,
      isStreamActive: false,
      isNeedToWaitVideo: true,

      /**
       * Used for real changes of `getUserWhoSharesMedia` getter, to prevent re-renders
       */
      userWhoSharesMedia: null,
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
      isSharingFullScreen: 'janus/isSharingFullScreen',
      miniChatLastMessageTimestamp: 'channels/getMiniChatLastMessageTimestamp',
      miniChatMessages: 'channels/getMiniChatMessages',
    }),

    /**
     * That value depends on local media state
     * In order to changing overlay size just after media state changes
     * @returns {boolean}
     */
    isLocalMediaSharing() {
      return !this.amISharingScreen && this.isAnybodySharingMedia;
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
        return this.getSpeakingUser.userId;
      }

      return false;
    },

    sharingUser() {
      const user = this.$store.getters['users/getUserById'](this.userWhoSharesMedia);

      if (!user) {
        return;
      }

      const channel = this.$store.getters['channels/getChannelById'](this.selectedChannelId);
      const mediaState = channel.users.filter(c => c.userId === user.id)[0];

      if (!mediaState) {
        return;
      }

      return {
        user,
        mediaState,
      };
    },

    isNeedToShowPreloader() {
      return !this.isMediaPlaying && this.isLocalMediaSharing;
    },

    /**
     * Is user sharing media
     * @returns {boolean}
     */
    isUserSharingMedia() {
      if (!this.sharingUser) {
        return false;
      }

      return this.sharingUser.mediaState.camera || this.sharingUser.mediaState.screen;
    },

    /**
     * Whether to show video
     * @returns {boolean}
     */
    mediaCanShow() {
      console.log('Media can show -->', this.isUserSharingMedia, this.isMediaPlaying, this.isStreamActive);

      if (this.isUserSharingMedia) {
        const state = this.isStreamActive && this.isMediaPlaying;

        if (this.isNeedToWaitVideo) {
          if (state) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.isNeedToWaitVideo = false;

            return true;
          }

          return false;
        } else {
          return true;
        }
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.isNeedToWaitVideo = true;
      }

      return false;
    },

    mediaMustPlayButDoesnt() {
      return this.isUserSharingMedia && !this.isMediaPlaying && !this.isStreamActive;
    },
  },

  watch: {
    // isLocalMediaSharing(value) {
    //   broadcastActions.dispatch('me/setMediaSharingMode', value);
    // },

    mediaCanShow(value) {
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
      this.userWhoSharesMedia = userId;
      this.loadCurrentVideo();
    },

    videoRoomState(info) {
      console.log('videoroom state: ', info);
    },

    isNeedToShowPreloader(val) {
      this.showPreloader(val);
    },

    miniChatLastMessageTimestamp(val) {
      if (!this.miniChatMessages.length) {
        return;
      }

      const lastMessage = this.miniChatMessages.slice(-1)[0];

      if (this.myId !== lastMessage.userId) {
        this.tryToShowLinkPush(lastMessage.userId, lastMessage.data.message);
      }
    },

    mediaMustPlayButDoesnt(state) {
      clearTimeout(mustPlayTimer);

      if (state) {
        /**
         * Media must play. Setting timer and reconnect to Janus
         */
        mustPlayTimer = setTimeout(async () => {
          console.log('Media must play --> reconnecting to janus');
          await this.destroyJanusConnection();
          await this.initJanusConnection();
        }, MUST_PLAY_TIMEOUT);
      }
      console.log('Media must play -->', state);
    },
  },

  async mounted() {
    Mousetrap.bind(['command+w', 'ctrl+w'], () => {
      return false;
    });

    await janusVideoroomWrapper.init();

    if (this.isLocalMediaSharing) {
      this.initJanusConnection();
    }

    this.showPreloader(this.isLocalMediaSharing);

    this.userWhoSharesMedia = this.getUserWhoSharesMedia;

    // this.preloaderSrc = (await import(/* webpackChunkName: "video" */ '@assets/mp4/video-preloader.mp4')).default;
  },

  beforeDestroy() {
    janusVideoroomWrapper.removeAllListeners('single-sub-stream');
    janusVideoroomWrapper.removeAllListeners('publisher-joined');

    const video = this.$refs['video'];

    if (video) {
      video.onplaying = null;
      video.onsuspend = null;
      video.ontimeupdate = null;
      video.onerror = null;
    }
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
      const userId = this.userWhoSharesMedia;

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
      if (this.userWhoSharesMedia) {
        broadcastEvents.removeAllListeners('grid-expanded-ready');
        /** Wait until expanded grid appears and send video frame */
        broadcastEvents.once('grid-expanded-ready', () => {
          broadcastEvents.dispatch('grid-expanded-set-video-frame', this.getFrameFromVideo());
        });

        broadcastActions.dispatch('openGrid', this.userWhoSharesMedia);
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
      const video = this.$refs.video;

      if (video.srcObject) {
        video.style.backgroundImage = `url(${this.getFrameFromVideo()})`;
      }

      video.srcObject = stream;

      video.onplaying = () => {
        this.setMediaPlaying(true);
      };

      video.onsuspend = () => {
        this.setMediaPlaying(false);
      };

      video.ontimeupdate = () => {
        this.timeUpdateHandler();
      };

      video.onerror = () => {
        this.videErrorHandler();
      };

      stream.onactive = () => {
        this.isStreamActive = true;
        console.log(`Media stream' --> active`);
      };

      stream.oninactive = () => {
        this.isStreamActive = false;
        console.log(`Media stream' --> inactive`);
      };

      this.isStreamActive = stream.active;
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

    /**
     * Set media playing state
     * @param {boolean} state – state
     * @returns {void}
     */
    setMediaPlaying(state) {
      if (state) {
        console.log('Video event --> playing');
      } else {
        console.log('Video event --> suspend');
      }

      this.isMediaPlaying = state;
    },

    /**
     * Video error handler
     * @returns {void}
     */
    videErrorHandler() {
      console.log('Video event --> error', this.$refs.video.error);
    },

    /**
     * Video time update event handler
     * @returns {void}
     */
    timeUpdateHandler() {
      if (!this.isMediaPlaying && this.$refs.video) {
        console.log(`Video event --> timeUpdate`, this.$refs.video.currentTime);
        this.setMediaPlaying(this.$refs.video.currentTime !== 0);
      }
    },

    async tryToShowLinkPush(userId, message) {
      const sanitizedMessage = xss(message);
      const links = linkify.find(sanitizedMessage);

      if (links.length > 0) {
        const firstLink = links[0].href.replace('http://', 'https://');

        const push = {
          inviteId: 'id-' + Date.now(),
          userId,
          local: true,
          name: 'link',
          message: { action: 'fastLink' },
          data: {
            link: firstLink,
          },
        };

        broadcastActions.dispatch('app/addPush', push);
      }
    },

    parseHTML(htmlStr) {
      let tmp = document.implementation.createHTMLDocument('');

      tmp.body.innerHTML = htmlStr;

      if (tmp.length === 1) {
        tmp = tmp[0];
      }

      return tmp;
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column
    height 100vh
    color var(--Text-white)

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
        background-size cover
        background-position center
        background-repeat no-repeat

      &__preloader
        position absolute
        z-index 1
        background var(--Background-white)
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
  padding 4px 6px
  border-radius 4px
  font-size 12px
  line-height 12px
  align-items center

  &__avatar
    margin-right 6px

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
