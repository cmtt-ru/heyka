<template>
    <router-link :to="'/main-window/workspace/channel/'+channel.id" class="channel">
        <svg-icon class="channel__type" :name="dynamicIcon" size="medium" stroke="var(--icon-1)"/>

        <div class="channel__content">

            <div class="channel__name-wrapper">
              <div v-textfade="channel.name" class="channel__name">{{channel.name}}</div>
              <ui-button
                v-show="isSelected"
                :type="7"
                class="channel__more"
                size="small"
                height="16"
                @click.native="$emit('more')"
                icon="more"/>
            </div>

            <div v-show="channel.users.length" class="channel__users">
                <div class="channel__users__avatars">
                  <avatar v-for="person in users" :key="person.name" :image="person.avatar" :size="12"/>
                </div>
                <div v-if="extraUsers" class="channel__users__more">+{{extraUsers}}</div>
            </div>

        </div>

    </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';

const ICON_MAP = {
  public: 'channel',
  publicOnline: 'channelOnAir',
  private: 'lock',
  temp: 'clock',
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
    channel: Object,
  },

  computed: {
    /**
     * Get users array
     * @returns {array} array of users
     */
    users() {
      return this.$store.getters.getUsersByChannel(this.channel.id);
    },

    /**
     * Show icon corresponding to channel status
     * @returns {string} name of correct icon
     */
    dynamicIcon() {
      if (this.channel.isPrivate) { // TODO: lifespan
        return ICON_MAP['private'];
      } else {
        if (this.channel.talking) {
          return ICON_MAP['publicOnline'];
        } else {
          return ICON_MAP['public'];
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
    margin 4px 4px 0 4px
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
    align-self flex-start

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
  box-shadow 0px 1px 2px rgba(0, 0, 0, 0.1)
</style>
