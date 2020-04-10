<template>
  <div v-if="user" class="l-p-12">

      <div class="user">
        <avatar class="user__avatar" :key="user.avatar" :image="user.avatar" :size="40"></avatar>
        <div v-textfade="user.name" class="user__name">{{user.name}}</div>
        <!-- <div>TODO: user role</div> -->
        <div :style="statusStyle" class="user__status"></div>
        <ui-button
            :type="7"
            class="user__more"
            size="small"
            @click.native="$emit('more')"
            icon="more">
        </ui-button>
      </div>

      <div v-if="user.onlineStatus==='offline'">
        <ui-button :type="2" :wide="true" class="user-action">
          Send invite by Slack
        </ui-button>
      </div>

      <div v-else>
        <ui-button :type="1" :wide="true" class="user-action">
          Private talk
        </ui-button>
        <ui-button v-if="selectedChannelName" :type="3" :wide="true" class="user-action">
          <div>Invite to</div>
          <svg-icon class="icon-in-button" name="channelOnAir" size="medium" animate>
            <channel-on-air></channel-on-air>
          </svg-icon>
          <div>{{selectedChannelName}}</div>
        </ui-button>
      </div>

      <div class="user-info">
        <div class="user-info__title">Local time</div>
        <div class="user-info__content">{{time}}</div>
      </div>

      <div class="user-info">
        <div class="user-info__title">Email</div>
        <div class="user-info__content user-info__content--email">{{user.email}}</div>
      </div>
  </div>

</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import channelOnAir from '@assets/iconsAnimate/channelOnAir.vue';

/**
 * status-to-color map (small circle to the right of username)
 */
const STATUS_COLORS = {
  online: {
    'background-color': 'var(--color-1)',
    'border-color': 'var(--color-1)',
  },
  idle: {
    'background-color': 'var(--color-3)',
    'border-color': 'var(--color-3)',
  },
  offline: {
    'background-color': 'transparent',
    'border-color': 'var(--color-4)',
  },
};

export default {
  components: {
    Avatar,
    UiButton,
    channelOnAir,
  },

  computed: {

    /**
     * Display user's time
     * @returns {String} hh:mm
     */
    time() {
      const now = new Date(); // TODO: 1) update every minute; 2) get user's timezone
      const twoDigits = 2;

      return now.getHours().toString()
        .padStart(twoDigits, '0') + ':' + now.getMinutes().toString()
        .padStart(twoDigits, '0');
    },

    /**
     * Get user ID from route param
     * @returns {String} – user ID
     */
    userId() {
      return this.$route.params.id;
    },

    /**
     * Returns current user
     * @returns {object} – user
     */
    user() {
      return this.$store.getters['users/getUserById'](this.userId);
    },

    /**
     * Determine if we are connected to current channel or not
     * @returns {boolean}
     */
    isConnected() {
      return this.$store.getters['me/getSelectedChannelId'] === this.channelId;
    },

    /**
     * Set status-circle color
     * @returns {Object} background-color and border-color
     */
    statusStyle() {
      return STATUS_COLORS[this.user.onlineStatus] || null;
    },

    /**
     * Returns selected channel
     * @returns {object} – channel
     */
    selectedChannel() {
      const selectedChannelId = this.$store.getters['me/getSelectedChannelId'];

      if (!selectedChannelId) {
        return false;
      }

      return this.$store.getters['channels/getChannelById'](selectedChannelId);
    },

    /**
     * Returns selected channel's name
     * @returns {string} – channel's name
     */
    selectedChannelName() {
      if (!this.selectedChannel) {
        return null;
      }

      return this.selectedChannel.name;
    },

  },

  methods: {

  },

};
</script>

<style lang="stylus" scoped>

.user
  height 40px
  padding 0
  margin-bottom 24px
  width 100%
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__avatar
    flex-shrink 0
    flex-grow 0

  &__name
    margin-left 12px
    font-weight 500
    font-size 18px
    flex-shrink 1

  &__status
    right 0px
    width 8px
    height 8px
    box-sizing border-box
    border-radius 50%
    border: 2px solid
    margin 2px 8px 0
    flex-shrink 0
    flex-grow 0

  &__more
    margin-left auto
    flex-shrink 0
    flex-grow 0
    margin-top -18px
    color var(--icon-1)

.user-action
  margin-bottom 8px

.icon-in-button
  margin 0 4px

.user-info
  margin-top 20px

  &__title
    font-size 12px
    color var(--text-1)

  &__content
    margin-top 4px

    &--email
      user-select all

</style>