<template>
  <div class="l-p-8">
        <div v-if="user" class="user">

            <ui-button :type="7" class="user__status" @click.native="switchProp('screen')" size="small" :icon="icons.screen"/>
            <ui-button :type="7" class="user__status" @click.native="switchProp('speakers')" size="small" :icon="icons.speakers"/>
            <ui-button :type="7" class="user__status" @click.native="switchProp('microphone')" size="small" :icon="icons.microphone"/>

            <avatar class="user__avatar" :image="user.avatar" :status="user.onlineStatus" :size="24"/>

        </div>

  </div>

</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';

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
  screen: {
    true: 'cast',
    false: 'video-off', //! поведение будет сложнее, со сменой цвета. поправим, когда будет скриншаринг
  },
};

export default {
  components: {
    UiButton,
    Avatar,
  },

  computed: {

    /**
     * Get our media state
     * @returns {object}
     */
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    /**
     * Get our full info
     * @returns {object}
     */
    user() {
      const myId = this.$store.getters['me/getMyId'];
      const commonInfo = this.$store.getters['users/getUserById'](myId);

      return {
        ...commonInfo,
        ...this.mediaState,
      };
    },

    /**
     * Determine which icons to show
     * @returns {object}
     */
    icons() {
      return {
        microphone: ICON_MAP.microphone[this.user.microphone],
        speakers: ICON_MAP.speakers[this.user.speakers],
        screen: ICON_MAP.screen[this.user.screen],
      };
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

        &:hover
            opacity 0.8

</style>
