<template>
    <div>
      <svg-icon class="channel-info__type" name="channel" size="medium"></svg-icon>

      <ui-button :type="7" class="user__status" :icon="icons.screen"/>
      <ui-button :type="7" class="user__status" :icon="icons.speakers"/>
      <ui-button :type="7" class="user__status" :icon="icons.microphone"/>

      <avatar class="user__avatar" :image="user.avatar" :status="user.onlineStatus" :size="24"/>

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
  data() {
    return {

    };
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
  },

  mounted() {
  },
};
</script>
