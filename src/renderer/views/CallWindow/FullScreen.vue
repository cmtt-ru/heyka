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
    <ui-button
      class="badge fullscreen"
      :type="7"
      size="medium"
      icon="fullscreen"
      @click="fullscreen()"
    />
    <div
      v-draggable="controlsOptions"
      class="bottom-control"
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

export default {
  components: {
    CallControls,
    UiButton,
    Avatar,
  },
  data() {
    return {
      userId: this.$route.params.id,
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
      console.log(this.$store.getters['users/getUserById'](this.userId));

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

  methods: {
    fullscreen() {
      console.log('puk');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .fullscreen-window
    display flex
    flex-direction column
    height 100vh
    background-color #999999

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
    margin 0 auto
    background-color var(--app-bg)
    border-radius 4px
</style>
