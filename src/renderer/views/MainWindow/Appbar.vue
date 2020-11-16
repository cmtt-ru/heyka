<template>
  <div
    class="appbar"
    :class="{'appbar--mac': IS_MAC}"
  >
    <div
      v-if="myWorkspace"
      class="workspace"
    >
      <div
        v-popover.click="{name: 'Workspace', permissions: $permissions.manageWorkspaces()}"
        class="workspace__wrapper"
      >
        <avatar
          class="workspace__avatar"
          :user-id="myWorkspace.id"
          :image="workspaceAvatar(myWorkspace, 20)"
          :size="20"
          :border-radius="6"
        />
        <div>{{ myWorkspace.name }}</div>
        <svg-icon
          class="workspace__expand"
          name="arrow-down"
          width="16"
          height="16"
        />
      </div>
    </div>

    <div
      v-if="myInfo"
      class="user"
      :class="{'user--mac': IS_MAC}"
    >
      <ui-button
        v-tooltip="speakerTooltip"
        :type="7"
        class="user__button"
        size="medium"
        :icon="icons.speakers"
        header
        square
        @click="switchProp('speakers')"
      />
      <ui-button
        v-tooltip="microphoneTooltip"
        :type="7"
        class="user__button"
        size="medium"
        :icon="icons.microphone"
        header
        square
        @click="switchProp('microphone')"
      />

      <avatar
        v-popover.click="{name: 'UserProfile'}"
        class="user__avatar"
        :image="userAvatar(myInfo.id, 32)"
        :user-id="myInfo.id"
        :status="myInfo.onlineStatus"
        :size="32"
      />
    </div>

    <div v-if="!IS_MAC">
      <ui-button
        :type="7"
        class="control__button"
        size="medium"
        icon="collapse"
        header
        @click="minimizeWindowHandler"
      />
      <ui-button
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
      <div class="mac-controls" />
      <div class="mac-controls" />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

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

export default {
  components: {
    UiButton,
    Avatar,
  },

  data() {
    return {
      IS_MAC,
    };
  },

  computed: {

    ...mapGetters({
      selectedChannel: 'myChannel',
      myInfo: 'myInfo',
      mediaState: 'me/getMediaState',
      userAvatar: 'users/getUserAvatarUrl',
      myWorkspace: 'myWorkspace',
    }),

    /**
     * Determine which icons to show
     * @returns {object}
     */
    icons() {
      return {
        microphone: ICON_MAP.microphone[this.myInfo.microphone],
        speakers: ICON_MAP.speakers[this.myInfo.speakers],
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
    padding 0 6px
    pointer-events initial
    font-weight bold

    &:hover
      background var(--new-UI-07)

    &:active
      background var(--new-UI-08)

    &.context-menu--opened .workspace__expand
      color var(--new-UI-01)

  &__expand
    margin-left 4px
    margin-top 1px

  &__avatar
    width 14px
    height 14px
    border-radius 2px
    margin-right 6px

.appbar
  width 100%
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  position relative

  &--mac
    flex-direction row-reverse

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
      background var(--new-system-02)
      color var(--new-UI-09)

     &:active
      background var(--new-system-02-2)

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
  background var(--new-UI-07)

  &__icon
    opacity 0

  &:hover .mac-controls__icon
    opacity 1

  &:active
    opacity 0.5

</style>
