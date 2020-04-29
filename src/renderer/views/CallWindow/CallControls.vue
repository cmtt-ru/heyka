<template>
    <div class="call-controls" :class="{'call-controls--row': row}">

      <div class="call-controls__row">
        <img class="call-controls__avatar" :src="speakingUserAvatar|formImageUrl(36)">

        <div class="call-controls__col">
          <p class="call-controls__user-name">{{ speakingUserName }}</p>

          <div class="call-controls__channel">
            <svg-icon name="channel" size="small"/>
            <span>{{ selectedChannelName }}</span>
          </div>
        </div>
      </div>

      <div class="call-controls__row call-controls__row--controls">
        <ui-button :type="7" class="call-controls__button" :icon="buttonIcons.screen"/>
        <ui-button :type="7" class="call-controls__button" :icon="buttonIcons.microphone"/>
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

  data() {
    return {
      lastSpeakingUser: null,
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
     * Determine which icons to show
     * @returns {object}
     */
    buttonIcons() {
      return {
        microphone: ICON_MAP.microphone[this.mediaState.microphone],
        speakers: ICON_MAP.speakers[this.mediaState.speakers],
        screen: ICON_MAP.screen[this.mediaState.screen],
      };
    },

    /**
     * Speaking user
     * @return {object}
     */
    speakingUser() {
      if (this.selectedChannel) {
        const speakingUsers = this.selectedChannel.users.filter(u => u.speaking);

        if (speakingUsers.length) {
          const speakingUserId = speakingUsers[0].userId;
          const speakingUser = this.$store.getters['users/getUserById'](speakingUserId);

          if (speakingUser) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.lastSpeakingUser = speakingUser;

            return speakingUser;
          }
        }
      }

      return this.lastSpeakingUser;
    },

    /**
     * Speaking user name
     * @return {string}
     */
    speakingUserName() {
      if (this.speakingUser) {
        return this.speakingUser.name;
      }

      return 'no user';
    },

    /**
     * Speaking user avatar
     * @return {string}
     */
    speakingUserAvatar() {
      if (this.speakingUser) {
        return this.speakingUser.avatar;
      }

      return 'https://leonardo.osnova.io/d88552dc-5807-ea3c-a227-7c2d90209fc0/';
    },

    /**
     * Selected channel
     * @return {object}
     */
    selectedChannel() {
      const selectedChannelId = this.$store.getters['me/getSelectedChannelId'];
      const selectedChannel = this.$store.getters['channels/getChannelById'](selectedChannelId);

      if (selectedChannel) {
        return selectedChannel;
      }

      return false;
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

      &--controls
        flex-shrink: 0;

    &__col
      margin-left 8px

    &__avatar
      display block
      width 36px
      height 36px
      border-radius 4px
      flex-shrink: 0;

    &__user-name
      margin-top 3px
      overflow hidden
      text-overflow ellipsis
      white-space nowrap

    &__channel
      display flex
      color var(--text-1)
      align-items center
      font-size 12px
      line-height 14px
      margin-left -2px
      margin-top 1px
      flex-shrink: 0;

    &__button
      margin-right 8px
      flex-shrink 0

      &--disconnect
        color var(--color-0)

      &:last-child
        margin-right 0

    &--row
      flex-direction row

      .call-controls__row--controls
        margin-left auto

</style>
