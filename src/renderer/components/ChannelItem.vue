<template>
    <router-link to="#" :class="{'channel--active': channel.active}" class="channel">
        <svg-icon v-if="!channel.talking" class="channel__type" :name="dynamicIcon" size="medium" stroke="var(--icon-1)"></svg-icon>
        <svg-icon v-if="channel.talking" class="channel__type" name="channelOnAir" size="medium" animate>
          <channel-on-air></channel-on-air>
        </svg-icon>
        <div class="channel__content">
            <div class="channel__name">{{channel.name}}</div>
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
export default {
  components: {
    Avatar,
    channelOnAir,
  },
  props: { channel: Object },
  data() {
    return {
      iconMap: {
        public: 'channel',
        private: 'lock',
        temp: 'clock',
        default: 'channel',
      },
      maxUsers: 8,
    };
  },
  computed: {
    dynamicIcon() {
      if ({}.hasOwnProperty.call(this.iconMap, this.channel.type)) {
        return this.iconMap[this.channel.type];
      } else {
        return this.iconMap.default;
      }
    },
    extraUsers() {
      if (this.channel.online.length > this.maxUsers) {
        return this.channel.online.length - this.maxUsers;
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
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
    opacity 0
    transition opacity 0.2s linear

  &--active //TODO: .router-link-active
    background-color var(--item-bg-active)

    &::after
      opacity 1

    &:hover
      background-color var(--item-bg-active)

  &__type
    margin 4px 4px 0 4px
    display flex

  &__content
    display block

  &__name
    font-style normal
    font-weight normal
    max-width 160px
    overflow hidden
    text-overflow ellipsis //? Заменить на уход в прозрачность
    white-space nowrap
    padding 3px 0

  &__users
    height 12px
    margin-bottom 3px
    display flex
    flex-direction row
    align-items center

    &__avatars
      max-width 95px
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
</style>
