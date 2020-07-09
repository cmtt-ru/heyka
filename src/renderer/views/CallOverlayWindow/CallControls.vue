<template>
  <div
    v-if="user"
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
          <transition
            name="fade"
            mode="out-in"
          >
            <svg-icon
              :key="channelIcon"
              :name="channelIcon"
              size="small"
            />
          </transition>
          <transition
            name="fade"
            mode="out-in"
          >
            <span :key="channelName">{{ channelName }}</span>
          </transition>
        </div>
      </div>
    </div>

    <div class="call-controls__row call-controls__row--controls">
      <call-buttons :buttons="buttons" />
    </div>
  </div>
</template>

<script>
import CallButtons from './CallButtons';
import { mapGetters } from 'vuex';

const LAST_USER_INTERVAL = 2000;

let lastUserTimer = null;

export default {
  components: {
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
      channelIcon: 'channel',
      channelName: 'no channel',
    };
  },

  computed: {
    ...mapGetters({
      user: 'myInfo',
      speakingUser: 'getSpeakingUser',
      selectedChannel: 'myChannel',
      userById: 'users/getUserById',
    }),

    /**
     * Speaking user name
     * @return {string}
     */
    speakingUserName() {
      return this.speakingUser?.name || this.user?.name || '';
    },

    /**
     * Speaking user avatar
     * @return {string}
     */
    speakingUserAvatar() {
      return this.speakingUser?.avatar || this.user?.avatar || '';
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

    lastUserInChannel() {
      if (this.selectedChannel) {
        return this.selectedChannel.users[this.selectedChannel.users.length - 1];
      }

      return false;
    },
  },

  watch: {
    lastUserInChannel() {
      if (!this.lastUserInChannel) {
        return;
      }

      if (this.user.id !== this.lastUserInChannel.userId) {
        this.channelName = this.userById(this.lastUserInChannel.userId).name;
        this.channelIcon = 'connect';

        clearTimeout(lastUserTimer);

        lastUserTimer = setTimeout(() => {
          this.channelName = this.selectedChannel.name;
          this.channelIcon = 'channel';
        }, LAST_USER_INTERVAL);
      }
    },

    selectedChannelName() {
      this.channelName = this.selectedChannelName;
    },
  },

  mounted() {
    this.channelName = this.selectedChannelName;
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

  .fade-enter-active,
  .fade-leave-active
    transition all 0.25s

  .fade-enter,
  .fade-leave-to
    opacity 0

</style>
