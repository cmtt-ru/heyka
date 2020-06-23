<template>
  <div class="l-p-8">
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
        @click.native="switchProp('speakers')"
      />

      <avatar
        v-popover.click="{name: 'UserProfile'}"
        class="user__avatar"
        :image="myInfo.avatar"
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
      myInfo: 'myInfo',
      mediaState: 'me/getMediaState',
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
