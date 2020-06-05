<template>
  <div
    class="call-controls"
    :class="{'call-controls--row': row}"
  >
    <div class="call-controls__row">
      <img
        class="call-controls__avatar"
        :src="speakingUserAvatar|formImageUrl(36)"
      >

      <div class="call-controls__col">
        <p class="call-controls__user-name">
          {{ speakingUserName }}
        </p>

        <div class="call-controls__channel">
          <svg-icon
            name="channel"
            size="small"
          />
          <span>{{ selectedChannelName }}</span>
        </div>
      </div>
    </div>

    <div class="call-controls__row call-controls__row--controls">
      <call-buttons :buttons="buttons" />
    </div>
  </div>
</template>

<script>
// import UiButton from '@components/UiButton';
// import broadcastActions from '@classes/broadcastActions';
import CallButtons from './CallButtons';

export default {
  components: {
    // UiButton,
    CallButtons,
  },

  props: {
    /**
     * Arrange buttons in row
     */
    row: {
      type: Boolean,
      default: false,
    },

    /**
     * Buttons list
     * @example ['screen', 'camera', 'speakers', 'microphone', 'grid', 'leave']
     */
    buttons: {
      type: Array,
      default: function () {
        return ['microphone', 'camera', 'screen', 'speakers', 'leave'];
      },
    },
  },

  data() {
    return {
      lastSpeakingUser: null,
    };
  },

  computed: {
    /**
     * Get our full info
     * @returns {object}
     */
    user() {
      const myId = this.$store.getters['me/getMyId'];

      return this.$store.getters['users/getUserById'](myId);
    },

    /**
     * Speaking user
     * @return {object}
     */
    speakingUser() {
      return this.$store.getters['getSpeakingUser'];
    },

    /**
     * Speaking user name
     * @return {string}
     */
    speakingUserName() {
      if (this.speakingUser) {
        return this.speakingUser.name;
      }

      return this.user.name || '';
    },

    /**
     * Speaking user avatar
     * @return {string}
     */
    speakingUserAvatar() {
      if (this.speakingUser) {
        return this.speakingUser.avatar;
      }

      return this.user.avatar || '';
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
        flex-shrink 0

      &:last-child
        margin-bottom 0

    &__col
      margin-left 8px

    &__avatar
      display block
      width 36px
      height 36px
      border-radius 4px
      flex-shrink 0

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

      svg
        flex-shrink 0

      span
        min-width 0
        overflow hidden
        text-overflow ellipsis
        white-space nowrap

    &__button
      margin-right 8px
      flex-shrink 0

      &--disconnect
        color var(--color-0)

      &:last-child
        margin-right 0

    &--row
      flex-direction row

      .call-controls__row
        margin-bottom 0

      .call-controls__row--controls
        margin-left auto

</style>
