<template>
  <div
    id="header"
    class="appbar"
    :class="{'appbar--mac': IS_MAC}"
  >
    <div
      v-if="myWorkspace && myId"
      class="workspace"
    >
      <div
        v-popover.click="{name: 'Workspace', permissions: $permissions.manageWorkspaces(), options: {modifiers:[{name: 'offset',
                                                                                                                 options: {
                                                                                                                   offset: [0, 8],
                                                                                                                 },}]}}"
        class="workspace__wrapper"
      >
        <avatar
          class="workspace__avatar"
          :user-id="myWorkspace.id"
          :image="workspaceAvatar(myWorkspace, 20)"
          :size="20"
          :border-radius="6"
        />
        <div v-textfade>
          {{ myWorkspace.name }}
        </div>
        <svg-icon
          class="workspace__expand"
          name="arrow-down"
          width="16"
          height="16"
        />
      </div>
    </div>

    <div v-if="!IS_MAC">
      <ui-button
        v-if="!tray"
        :type="7"
        class="control__button"
        size="medium"
        icon="collapse"
        header
        @click="minimizeWindowHandler"
      />
      <ui-button
        v-if="!tray"
        :type="7"
        class="control__button control__button--win-close"
        size="medium"
        icon="close"
        header
        @click="closeWindowHandler"
      />
    </div>

    <div
      v-if="IS_MAC"
      class="mac-controls-wrapper"
    >
      <div
        v-if="!tray"
        class="mac-controls"
      />
      <div
        v-if="!tray"
        class="mac-controls"
      />
    </div>

    <div
      v-if="myId"
      class="user"
      :class="{'user--mac': IS_MAC}"
    >
      <ui-button
        v-if="myWorkspace"
        v-tooltip="microphoneTooltip"
        :type="7"
        class="user__button"
        size="medium"
        :icon="icons.microphone"
        header
        square
        @click="switchProp('microphone')"
      />
      <ui-button
        v-if="myWorkspace"
        v-tooltip="$t('tooltips.settings')"
        :type="7"
        class="user__button"
        :class="settingsClass"
        size="medium"
        icon="settings"
        header
        square
        @click="toggleSettings"
      />
      <avatar
        v-popover.click="{name: 'UserProfile'}"
        class="user__avatar"
        :user-id="myId"
        :status="true"
        :size="32"
      />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

import Mousetrap from 'mousetrap';

/**
 * Map media state points to corresponding icons
 */
const ICON_MAP = {
  microphone: {
    true: 'mic',
    false: 'mic-off',
  },
  speakers: {
    true: 'headphones',
    false: 'headphones-off',
  },
};

const windowId = WindowManager.getCurrentWindowId();

export default {
  components: {
    UiButton,
    Avatar,
  },

  data() {
    return {
      IS_MAC,
      tray: false,
    };
  },

  computed: {

    ...mapGetters({
      selectedChannel: 'myChannel',
      myInfo: 'myInfo',
      mediaState: 'me/getMediaState',
      userAvatar: 'users/getUserAvatarUrl',
      myWorkspace: 'myWorkspace',
      myId: 'me/getMyId',
    }),

    /**
     * Determine which icons to show
     * @returns {object}
     */
    icons() {
      return {
        microphone: ICON_MAP.microphone[this.myInfo.mediaState.microphone],
        speakers: ICON_MAP.speakers[this.myInfo.mediaState.speakers],
      };
    },

    /**
     * Microphone tooltip
     * @returns {string}
     */
    microphoneTooltip() {
      if (this.mediaState.microphone) {
        return this.$t('tooltips.microphoneOff');
      } else {
        return this.$t('tooltips.microphoneOn');
      }
    },

    /**
     * Speaker tooltip
     * @returns {string}
     */
    speakerTooltip() {
      if (this.mediaState.speakers) {
        return this.$t('tooltips.speakerOff');
      } else {
        return this.$t('tooltips.speakerOn');
      }
    },

    settingsClass() {
      if (this.$route.fullPath.includes('/settings')) {
        return 'user__button--opened';
      }

      return '';
    },
  },

  created() {
    if (this.$store.state.app.runAppFrom === 'tray') {
      this.tray = true;
    }
    Mousetrap.bind(['command+,', 'ctrl+,'], () => {
      this.toggleSettings();
    });
  },

  mounted() {
    window.ipcRenderer.on(`window-blur-${windowId}`, () => {
      this.changeStyle('blur');
    });
    window.ipcRenderer.on(`window-focus-${windowId}`, () => {
      this.changeStyle('focus');
    });
  },

  beforeDestroy() {
    window.ipcRenderer.removeAllListeners(`window-blur-${windowId}`);
    window.ipcRenderer.removeAllListeners(`window-focus-${windowId}`);
  },

  methods: {

    workspaceAvatar: getUserAvatarUrl,

    closeWindowHandler() {
      WindowManager.getCurrentWindow().action('hide');
    },

    minimizeWindowHandler() {
      WindowManager.getCurrentWindow().action('minimize');
    },

    /**
     * Change our media state depending on which button was clicked
     * @param {string} property mediastate's property name
     * @returns {void}
     */
    switchProp(property) {
      const newState = { ...this.mediaState };

      newState[property] = !this.mediaState[property];
      /* Disable 'speaking' avatar stroke if we mute mic */
      if (!newState.microphone) {
        newState.speaking = false;
      }
      this.$store.dispatch('me/setMediaState', newState);
    },

    changeStyle(action) {
      if (action === 'blur') {
        document.getElementById('header').classList.add('appbar--blurred');
      } else {
        document.getElementById('header').classList.remove('appbar--blurred');
      }
    },

    toggleSettings() {
      if (this.$route.fullPath.includes('/settings')) {
        this.__backOrRedirect();
      } else if (this.$route.fullPath.includes('/styleguide')) {
        this.$router.replace({ name: 'workspace' });
      } else {
        this.$router.push({ name: 'settings' });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

.workspace
  position absolute
  left 0
  right 0
  margin 0 auto
  display flex
  flex-direction row
  justify-content center
  align-items center
  height 32px
  pointer-events none

  &__wrapper
    cursor pointer
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    -webkit-app-region no-drag
    border-radius 8px
    height 32px
    max-width 230px
    line-height 16px
    padding 0 6px
    pointer-events initial
    font-weight bold

    &:hover
      background var(--Background-grey-hover)

    &:active
      background var(--Background-grey-active)

    &.context-menu--opened .workspace__expand
      color var(--UI-active)

  &__expand
    margin-left 4px
    color var(--Text-secondary)
    flex-shrink 0

  &__avatar
    width 14px
    height 14px
    border-radius 2px
    margin-right 6px
    flex-shrink 0

.appbar
  width 100%
  display flex
  flex-direction row-reverse
  justify-content space-between
  align-items center
  position relative
  padding 8px

  &--blurred
    opacity 0.8
    background var(--Background-darkgrey)

  &--mac
    flex-direction row

.user
  display flex
  flex-direction row-reverse
  justify-content flex-end
  align-items center

  &--mac
    flex-direction row

    & .user__avatar
      margin 0 4px 0 7px

  &__button
    margin-right 4px

    &--opened
      background var(--Background-white)

  &__avatar
    margin 0 11px 0 4px
    cursor pointer
    border-radius 50%
    -webkit-app-region no-drag

    &:hover
      opacity 0.8

    &:active
      opacity 0.7

.control__button
  margin-left 4px

  &--win-close

    &:hover, &:active
      mix-blend-mode initial
      background var(--UI-error-hover)
      color var(--Text-white)

     &:active
      background var(--UI-error-active)

.mac-controls-wrapper
  margin-left 10px

.mac-controls
  margin-right 8px
  width 12px
  height 12px
  border-radius 50%
  box-sizing border-box
  display inline-flex
  flex-direction row
  justify-content center
  align-items center
  background var(--Text-secondary)

  &__icon
    opacity 0

  &:hover .mac-controls__icon
    opacity 1

  &:active
    opacity 0.5

</style>
