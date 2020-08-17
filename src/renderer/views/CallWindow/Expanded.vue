<template>
  <div
    ref="expanded"
    class="expanded-window"
    :style="$themes.getColors('popover')"
    @dblclick="showGridHandler"
  >
    <div class="sharing-wrapper wrapper">
      <video
        ref="video"
        class="sharing"
      />
      <img
        v-show="showPreview"
        ref="preview"
        class="video-preview"
      >
      <div
        v-if="canDraw"
        class="tablet-wrapper wrapper"
      >
        <div class="tablet">
          <tablet
            :aspect-ratio="1 / videoAspectRatio"
            :my-id="myId"
            :color="myColor"
            @data="onDrawingData"
          />
        </div>
      </div>
    </div>

    <div class="badge user">
      <avatar
        class="user__avatar"
        :image="userAvatar(sharingUser.id, 20)"
        :size="20"
        square
      />
      <div class="user__name">
        {{ sharingUser.name }}
      </div>
    </div>

    <ui-button
      v-popover.click="{name: 'Devices'}"
      class="badge settings"
      :type="7"
      size="medium"
      icon="settings"
    />
    <router-link to="/call-window">
      <ui-button
        class="badge expanded"
        :type="7"
        size="medium"
        icon="grid"
      />
    </router-link>
    <div
      ref="controls"
      v-draggable="controlsOptions"
      class="badge control"
      :class="{'control--hidden': !showControls}"
    >
      <call-controls />
    </div>
  </div>
</template>

<script>
import CallControls from '../CallOverlayWindow/CallControls';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import broadcastEvents from '@classes/broadcastEvents';
import { mapGetters, mapState } from 'vuex';
import Tablet from '@components/Drawing/Tablet';
import mediaCapturer from '@classes/mediaCapturer';
import janusVideoroomWrapper from '../../classes/janusVideoroomWrapper';
import { ipcRenderer } from 'electron';

/* variable for watching page size */
let __resizeObserver = {};

export default {
  components: {
    CallControls,
    UiButton,
    Avatar,
    Tablet,
  },
  data() {
    return {
      videoAspectRatio: 1,
      userId: this.$route.params.id,
      showControls: true,
      controlsOptions: {
        boundingElement: document.documentElement,
        initialPosition: {},
        resetInitialPos: false,
      },
      showPreview: false,
      myColor: 'black',
      canDraw: false,
    };
  },
  computed: {
    ...mapGetters({
      selectedChannel: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
      userAvatar: 'users/getUserAvatarUrl',
    }),
    ...mapState({
      janusOptions: 'janus',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.grid');
    },

    /**
     * Get user, who's sharing we are watching now
     * @returns {object}
     */
    sharingUser() {
      return this.$store.getters['users/getUserById'](this.userId);
    },

    /**
     * Is current user sharing media
     * @returns {boolean}
     */
    isUserSharingMedia() {
      return this.$store.getters.getUsersWhoShareMedia.includes(this.userId);
    },

  },
  watch: {
    isUserSharingMedia(val) {
      if (val === false) {
        this.showGridHandler();
      }
    },
  },

  /**
   * Subscribe for:
   * 1. blur/focus window events for hiding/showing call controls
   * 2. custom "grid" event for routing to grid
   * @returns {void}
   */
  mounted() {
    const page = this.$refs.expanded;

    __resizeObserver = new ResizeObserver(this.watchPageDimensions);
    __resizeObserver.observe(page);

    const w = WindowManager.getCurrentWindow();

    w.on('blur', () => {
      this.showControls = false;
    });
    w.on('focus', () => {
      this.showControls = true;
    });

    broadcastEvents.on('grid', () => {
      this.$router.replace('/call-window');
    });

    broadcastEvents.dispatch('grid-expanded-ready');

    broadcastEvents.on('grid-expanded-set-video-frame', this.setVideoFrame.bind(this));

    this.handleVideoStream();

    janusVideoroomWrapper.on('new-stream', publisher => {
      if (publisher.userId === this.userId) {
        this.insertVideo(publisher.stream);
      }
    });
    janusVideoroomWrapper.on('publisher-joined', publisher => {
      if (publisher.userId === this.userId) {
        this.handleVideoStream();
      }
    });
    janusVideoroomWrapper.on('textroom-data', this.onTextroomData.bind(this));
  },

  beforeDestroy() {
    janusVideoroomWrapper.disconnectTextroom();
    janusVideoroomWrapper.removeAllListeners('new-stream');
    janusVideoroomWrapper.removeAllListeners('publisher-joined');

    this.$refs.video.onerror = null;
    this.$refs.video.onloadedmetadata = null;
    __resizeObserver.unobserve(this.$refs.expanded);
  },

  destroyed() {
    broadcastEvents.removeAllListeners('grid');
    broadcastEvents.removeAllListeners('grid-expanded-set-video-frame');

    const w = WindowManager.getCurrentWindow();

    w.removeAllListeners('blur');
    w.removeAllListeners('focus');
  },

  methods: {

    /**
     * Re-adjust controls position on page resize
     * @returns {void}
     */
    watchPageDimensions() {
      const page = this.$refs.expanded;
      const width = page.offsetWidth;
      const height = page.offsetHeight;

      const controlsMarginBottom = 126;
      const controlsMarginLeft = 92;

      this.controlsOptions.initialPosition.left = width / 2 - controlsMarginLeft;
      this.controlsOptions.initialPosition.top = height - controlsMarginBottom;
      this.controlsOptions.resetInitialPos = true;
      this.$nextTick(() => (this.controlsOptions.resetInitialPos = false));
    },

    /**
     * Show grid handler
     * @returns {void}
     */
    showGridHandler() {
      if (WindowManager.getCurrentWindow().isFullscreen()) {
        ipcRenderer.send('exit-fullscreen');
      }

      this.$router.push('/call-window');
    },

    handleVideoStream() {
      // try to get working video stream
      const activePublishers = janusVideoroomWrapper.getActivePublishers();
      const ourPublisher = activePublishers.find(publishers => publishers.userId === this.userId);

      if (ourPublisher) {
        if (ourPublisher.stream) {
          this.insertVideo(ourPublisher.stream);

          return;
        }
        janusVideoroomWrapper.subscribeFor(ourPublisher.janusId);
      }

      // set on pause all videos except this one
      activePublishers
        .filter(publisher => publisher.userId !== this.userId)
        .forEach(publisher => janusVideoroomWrapper.pauseSubscription(publisher.janusId));
    },

    /**
     * Insert video in html
     * @param {MediaStream} stream Media stream
     * @returns {void}
     */
    insertVideo(stream) {
      janusVideoroomWrapper.connectTextroom(this.myId, 'sender', this.janusOptions);
      const video = this.$refs.video;

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        this.videoAspectRatio = mediaCapturer.getRatioList(stream)[0];
        video.play();
        this.showPreview = null;
      };

      video.onerror = () => {
        this.showPreview = null;
      };
    },

    /**
     * Set video frame
     * @param {string} base64Image – video frame
     * @returns {void}
     */
    setVideoFrame(base64Image) {
      this.$refs.preview.src = base64Image;
      if (this.showPreview === false) {
        this.showPreview = true;
      }
    },

    /**
     * Handles new drawing data from Tablet
     * @param {object} data Drawing data
     * @param {object} data.userId User id
     * @returns {void}
     */
    onDrawingData(data) {
      janusVideoroomWrapper.sendData(data, this.userId);
    },

    /**
     * Handles new drawing data from the textroom plugin
     * @param {object} data Drawing data
     * @returns {void}
     */
    onTextroomData(data) {
      const from = data.from;
      const drawingData = JSON.parse(data.text);

      drawingData.userId = from
        .replace('(receiver)', '');
      if (drawingData.userId === this.userId && drawingData.canDraw !== undefined) {
        this.canDraw = drawingData.canDraw;
        if (drawingData.canDraw) {
          this.myColor = drawingData.color;
        }
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

  .expanded-window
    position relative
    width 100%
    height 100%

  .wrapper
    position absolute
    top 0px
    left 0px
    height 100vh
    width 100vw
    flex-direction column
    display flex

  .tablet-wrapper
    width 100vw
    .tablet
      width 100%
      height 100%

  .sharing
    width 100%
    height 100%
    background-color var(--app-bg)

  .video-preview
    background-color var(--app-bg)
    position absolute
    left 0
    top 0
    width 100%
    height 100%
    object-fit contain
    filter blur(5px) grayscale(1)

  .badge
    position absolute

  .user
    top 30px
    left 30px
    display flex
    flex-direction row
    background-color var(--button-bg-5)
    padding 8px
    border-radius 4px
    font-weight 500
    align-items center

    &__avatar
      margin-right 8px

  .settings
    top 30px
    right 30px

  .expanded
    bottom 30px
    right 30px

  .control
    background-color var(--app-bg)
    border-radius 4px
    top calc(100% - 126px)
    left calc(50% - 92px)
    height auto
    opacity 1
    transition opacity 0.2s ease
    box-shadow 0 0 0 1px var(--button-bg-5)

    &--hidden
      opacity 0
      pointer-events none

</style>
