<template>
  <router-link
    :to="'/main-window/workspace/channel/' + channel.id"
    class="channel"
  >
    <svg-icon
      class="channel__type"
      :name="dynamicIcon.name"
      :stroke="dynamicIcon.color"
      size="medium"
    />

    <div class="channel__content">
      <div class="channel__name-wrapper">
        <div
          v-textfade
          class="channel__name"
        >
          {{ channel.name }}
        </div>
        <ui-button
          v-show="isSelected"
          v-stop-propagation
          v-popover.click="{name: 'Channel', data: {id: channel.id}, permissions: $permissions.editChannel(channel.id)}"
          :type="7"
          class="channel__more"
          size="small"
          height="16"
          icon="more"
        />
      </div>

      <div
        v-show="users.length"
        class="channel__users"
      >
        <div class="channel__users__avatars">
          <avatar
            v-for="person in users"
            :key="person.name"
            :user-id="person.id"
            :image="userAvatar(person.id, 12)"
            :size="12"
          />
        </div>
        <div
          v-if="extraUsers"
          class="channel__users__more"
        >
          +{{ extraUsers }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';

const ICON_MAP = {
  public: 'channel',
  publicOnline: 'channelOnAir',
  private: 'lock',
  temp: 'time',
  default: 'channel',
};
const MAX_USERS = 8;

export default {
  components: {
    Avatar,
    UiButton,
  },
  props: {
    /**
     * Object with full channel info
     */
    channel: {
      type: Object,
      default: function () {
        return {};
      },
    },
    /**
     * Whether we should explude us from avatar row
     * (just for smooth connect-to-channel-animations)
     */
    excludeMe: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters({
      myId: 'me/getMyId',
      me: 'myInfo',
      userAvatar: 'users/getUserAvatarUrl',
    }),

    /**
     * Get users array
     * @returns {array} array of users
     */
    users() {
      const otherUsers = this.$store.getters.getUsersByChannel(this.channel.id).filter((user) => user.id !== this.myId);

      if (this.excludeMe) {
        return otherUsers;
      } else {
        return [this.me, ...otherUsers];
      }
    },

    /**
     * Determine if people are talking in a channel
     * @returns {boolean}
     */
    isChannelActive() {
      const peopleTalking = this.users.filter((user) => user.microphone).length;

      return !!peopleTalking;
    },

    /**
     * Show icon corresponding to channel status
     * @returns {string} name of correct icon
     */
    dynamicIcon() {
      if (this.channel.isPrivate && !this.channel.isTemporary) { // TODO: lifespan
        return {
          name: ICON_MAP['private'],
          color: this.isChannelActive ? 'var(--color-1)' : undefined,
        };
      } else if (this.channel.isPrivate && this.channel.isTemporary) {
        return {
          name: ICON_MAP['temp'],
          color: this.isChannelActive ? 'var(--color-1)' : undefined,
        };
      } else {
        if (this.isChannelActive) {
          return {
            name: ICON_MAP['publicOnline'],
          };
        } else {
          return {
            name: ICON_MAP['public'],
          };
        }
      }
    },

    /**
     * Show "+x" after "MAX_USERS" amount of avatars
     * @returns {number} x in "+x"
     */
    extraUsers() {
      if (this.channel.users.length > MAX_USERS) {
        return this.channel.users.length - MAX_USERS;
      }

      return false;
    },

    /**
     * Return true if this channel is currently opened
     * @returns {boolean}
     */
    isSelected() {
      return this.$route.params.id === this.channel.id;
    },
  },

  methods: {
    /**
     * Dummy popover creation
     * @returns {void}
     */
    moreHandler() {
      this._notImplemented();
    },
  },

};
</script>

<style lang="stylus" scoped>
.channel
  padding 1px 0
  margin 2px 0
  width 100%
  border-radius 4px
  display flex
  flex-direction row
  align-items flex-start
  justify-content flex-start

  &:hover
    background-color var(--item-bg-hover)

  &__type
    margin 3px 4px 0 4px
    display flex

  &__name-wrapper
    padding 3px 0
    display flex
    flex-direction row
    align-items center
    justify-content space-between
    width 100%

  &__name
    font-style normal
    font-weight normal
    width 136px
    line-height 16px

  &__more
    color var(--icon-1)
    margin 0 4px

  &__users
    height 12px
    margin-bottom 3px
    display flex
    flex-direction row
    align-items center

    &__avatars
      max-width 124px
      overflow hidden
      display flex
      flex-direction row

      & .avatar
        margin-right 4px
        flex-shrink 0

    &__more
      font-size 12px
      margin-left 4px
      color var(--text-1)

.router-link-active
  background-color var(--item-bg-active)
  box-shadow 0 1px 2px rgba(0, 0, 0, 0.1)
</style>
