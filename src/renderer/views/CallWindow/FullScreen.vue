<template>
  <div
    class="fullscreen-window"
    :style="$themes.getColors('popover')"
  >
    <video class="sharing" />
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
        class="badge fullscreen"
        :type="7"
        size="medium"
        icon="grid"
      />
    </router-link>
    <div
      v-draggable="controlsOptions"
      class="badge bottom-control"
      :class="{'bottom-control--hidden': !showControls}"
    >
      <call-controls />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-magic-numbers */
import CallControls from '../CallOverlayWindow/CallControls';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
// import broadcastActions from '@classes/broadcastActions';
import electron from 'electron';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import broadcastEvents from '@classes/broadcastEvents';

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

    sharingUser() {
      return this.$store.getters['users/getUserById'](this.userId);
    },

    /**
     * Selected channel name
     * @return {string}
     */
    selectedChannelName() {
      if (this.selectedChannel) {
        return this.selectedChannel.name;
      }

      return 'no channel selected';
    },

  },

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
  },

  destroyed() {
    broadcastEvents.removeAllListeners('grid');
  },

  methods: {

    /**
     * Fullscreen button handler
     * @returns {void}
     */
    fullscreenHandler() {
      // broadcastActions.dispatch('fullscreenGrid');
      const window = electron.remote.getCurrentWindow();

      window.setFullScreen(!window.isFullScreen());
    },
  },
};
</script>

<style lang="stylus" scoped>
  .fullscreen-window
    display flex
    flex-direction column
    height 100vh

  .sharing
    width 100%
    height 100%
    background-color #dbdbdb

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

  .fullscreen
    bottom 30px
    right 30px

  .bottom-control
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
