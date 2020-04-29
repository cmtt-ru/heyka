<template>
    <div class="call-controls" :class="{'call-controls--row': row}">

      <div class="call-controls__row">
        <img class="call-controls__avatar" :src="speakingUser.avatar|formImageUrl(36)">

        <div class="call-controls__col">
          <p class="call-controls__user-name">Username</p>

          <div class="call-controls__channel">
            <svg-icon name="channel" size="small"/>
            <span>design</span>
          </div>
        </div>
      </div>

      <div class="call-controls__row call-controls__row--controls">
        <ui-button :type="7" class="call-controls__button" :icon="icons.screen"/>
        <ui-button :type="7" class="call-controls__button" :icon="icons.microphone"/>
        <ui-button :type="7" class="call-controls__button" icon="grid"/>
        <ui-button :type="7" class="call-controls__button call-controls__button--disconnect" icon="disconnect"/>
      </div>

    </div>
</template>

<script>
import UiButton from '@components/UiButton';

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
  },

  props: {
    row: {
      type: Boolean,
      default: false,
    },
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

    /**
     * Speaking user avatar
     * @return {string}
     */
    speakingUser() {
      return this.user;
    },
  },

  methods: {

  },
};
</script>

<style lang="stylus" scoped>
  .call-controls
    display flex
    flex-direction column
    padding 8px

    &__row
      display flex
      margin-bottom 8px

    &__col
      margin-left 8px

    &__avatar
      display block
      width 36px
      height 36px
      border-radius 4px

    &__user-name
      margin-top 3px

    &__channel
      display flex
      color var(--text-1)
      align-items center
      font-size 12px
      line-height 14px
      margin-left -2px
      margin-top 1px

    &__button
      margin-right 8px

      &--disconnect
        color var(--color-0)

      &:last-child
        margin-right 0

    &--row
      flex-direction row

      .call-controls__row--controls
        margin-left auto

</style>
