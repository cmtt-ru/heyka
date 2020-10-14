<template>
  <div class="appbar">
    <div>
      Appbar
    </div>

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
          :image="workspaceAvatar(myWorkspace, 14)"
          :size="14"
          :border-radius="2"
        />
        <div>{{ myWorkspace.name }}</div>
        <ui-button
          :type="7"
          class="workspace__expand"
          size="small"
          height="16"
          icon="arrow-down"
        />
      </div>
    </div>

    <div
      v-if="myInfo"
      class="user"
    >
      <microphone
        v-tooltip="microphoneTooltip"
        class="user__status"
        :active="myInfo.microphone"
        @click.native="switchProp('microphone')"
      />

      <ui-button
        v-tooltip="speakerTooltip"
        :type="7"
        class="user__status"
        size="small"
        :icon="icons.speakers"
        @click="switchProp('speakers')"
      />

      <avatar
        v-popover.click="{name: 'UserProfile'}"
        class="user__avatar"
        :image="userAvatar(myInfo.id, 24)"
        :user-id="myInfo.id"
        :status="myInfo.onlineStatus"
        :size="24"
      />
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Microphone from '@components/Microphone';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';

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
    Microphone,
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
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    padding 0 4px
    position relative
    height 24px

    &__wrapper
        cursor pointer
        display flex
        flex-direction row
        justify-content space-between
        align-items center
        -webkit-app-region no-drag

    &__expand
        margin-left 4px
        margin-top 1px

    &__avatar
        width 14px
        height 14px
        border-radius 2px
        margin-right 6px

    &__search
        position absolute
        top -4px
        bottom 0
        width 100%
        height 100%
        right 0
        pointer-events none

        &__input
          pointer-events auto
          background-color var(--button-bg-3)
          -webkit-app-region no-drag

        &__icon
          pointer-events auto
          position absolute
          right 0
          top 4px

          &--close
            top 8px
            right 8px

/deep/ .input
  padding-right 26px

.appbar
    width 100%
    display flex
    flex-direction row
    justify-content space-between
    align-items center

.user
    display flex
    flex-direction row
    justify-content flex-end
    align-items center

    &__status
        margin-left 8px

    &__avatar
        margin-left 12px
        margin-right 4px
        cursor pointer
        border-radius 50%
        -webkit-app-region no-drag

        &:hover
            opacity 0.8

</style>
