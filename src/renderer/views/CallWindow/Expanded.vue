<template>
  <div
    class="expanded-window"
    :style="$themes.getColors('popover')"
  >
    <!-- <svg
      class="svg-border"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="gradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stop-color="#00bc9b"
          />
          <stop
            offset="100%"
            stop-color="#5eaefd"
          />
        </linearGradient>
      </defs>
      <rect
        class="rect-path"
        stroke="url(#gradient)"
        style="fill:none"
      />
    </svg> -->

    <video
      ref="video"
      class="sharing"
    />

    <div class="badge user">
      <avatar
        class="user__avatar"
        :image="sharingUser.avatar"
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
import commonStreams from '@classes/commonStreams';

export default {
  components: {
    CallControls,
    UiButton,
    Avatar,
  },
  data() {
    return {
      userId: this.$route.params.id,
      showControls: true,
      controlsOptions: {
        boundingElement: document.documentElement,
      },
    };
  },
  computed: {
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

  },
  watch: {
    userId() {
      this.requestStream();
    },
  },

  /**
   * Subscribe for:
   * 1. blur/focus window events for hiding/showing call controls
   * 2. custom "grid" event for routing to grid
   * @returns {void}
   */
  mounted() {
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

    this.requestStream();
  },

  destroyed() {
    broadcastEvents.removeAllListeners('grid');

    const w = WindowManager.getCurrentWindow();

    w.removeAllListeners('blur');
    w.removeAllListeners('focus');
  },
  methods: {
    /**
     * Request stream and insert it
     * @returns {void}
     */
    async requestStream() {
      const id = this.userId;
      const stream = await commonStreams.getStream(id);

      this.$refs.video.srcObject = stream;
      this.$refs.video.onloadedmetadata = () => {
        this.$refs.video.play();
      };
    },
  },

};
</script>

<style lang="stylus" scoped>
  .expanded-window
    display flex
    flex-direction column
    height 100vh

  .sharing
    width 100%
    height 100%
    background-color #dbdbdb

  .svg-border
    width 100%
    height 100%
    position absolute
    top 0
    left 0
    background-color transparent

    .rect-path
      stroke-width 3px
      transform translate(2px, 2px)
      stroke-dasharray 100% 100%
      animation dash 20s linear infinite
      width calc(100% - 4px)
      height calc(100% - 4px)

  @keyframes dash {
      to {
        stroke-dashoffset: 200%;
      }
  }
  .badge
    position absolute

  .user
    top 30px
    left 30px
    display flex
    flex-direction row
    background-color var(--app-bg)
    padding 8px
    border-radius 4px

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

    &--hidden
      opacity 0
      pointer-events none

</style>
