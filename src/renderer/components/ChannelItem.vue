<template>
    <router-link :to="'/main-window/workspace/channel/'+channel.name" :class="{'channel--active': channel.active}" class="channel">
        <svg-icon v-if="!channel.talking" class="channel__type" :name="dynamicIcon" size="medium" stroke="var(--icon-1)"></svg-icon>
        <svg-icon v-if="channel.talking" class="channel__type" name="channelOnAir" size="medium" animate>
          <channel-on-air></channel-on-air>
        </svg-icon>

        <div class="channel__content">

            <div class="channel__name-wrapper">
              <div v-textfade="channel.name" class="channel__name">{{channel.name}}</div>
              <ui-button
                v-show="channel.active"
                :type="7"
                class="channel__more"
                size="small"
                height="16"
                @click.native="$emit('more')"
                icon="more">
              </ui-button>
            </div>

            <div v-show="channel.online.length" class="channel__users">
                <div class="channel__users__avatars">
                  <avatar v-for="person in channel.online" :key="person.name" :size="12"></avatar>
                </div>
                <div v-if="extraUsers" class="channel__users__more">+{{extraUsers}}</div>
            </div>

        </div>

    </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import channelOnAir from '@assets/iconsAnimate/channelOnAir.vue';
import UiButton from '@components/UiButton';

const ICON_MAP = {
  public: 'channel',
  private: 'lock',
  temp: 'clock',
  default: 'channel',
};
const MAX_USERS = 8;

export default {
  components: {
    Avatar,
    channelOnAir, // TODO: добавить и остальные анимированные иконки
    UiButton,
  },
  props: {
    /**
     * Object with full channel info
     */
    channel: Object,
  },
  data() {
    return {

    };
  },
  computed: {
    /**
     * Show icon corresponding to channel status
     * @returns {String} name of correct icon
     */
    dynamicIcon() {
      if ({}.hasOwnProperty.call(ICON_MAP, this.channel.type)) {
        return ICON_MAP[this.channel.type];
      } else {
        return ICON_MAP.default;
      }
    },

    /**
     * Show "+x" after "MAX_USERS" amount of avatars
     * @returns {Number} x in "+x"
     */
    extraUsers() {
      if (this.channel.online.length > MAX_USERS) {
        return this.channel.online.length - MAX_USERS;
      }

      return false;
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
  transition background-color 0.2s linear
  position relative

  &:hover
    background-color var(--item-bg-hover)

  &::after
    content ''
    position absolute
    top 0
    bottom 0
    left 0
    right 0
    box-shadow 0px 1px 2px rgba(0, 0, 0, 0.1)
    opacity 0
    pointer-events none
    transition opacity 0.2s linear

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

  &::after
    opacity 1
</style>
