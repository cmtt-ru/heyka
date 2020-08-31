<template>
  <div class="user-cursor-wrapper">
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      class="arrow"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.8646 12.7588C24.4416 11.1819 23.8077 8.4967 21.692 7.7915L4.6359 2.1061C3.0724 1.5849 1.5849 3.0724 2.1061 4.6359L7.7914 21.692C8.4967 23.8077 11.1818 24.4416 12.7588 22.8647L22.8646 12.7588Z"
        :fill="color"
        stroke="white"
        stroke-width="3"
      />
    </svg>
    <div
      class="badge"
      :style="{'background-color': color}"
    >
      <avatar
        class="badge__avatar"
        :image="userAvatar(user.id, 12)"
        :user-id="user.id"
        :size="12"
        square
      />
      <div class="badge__name">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';

export default {
  components: {
    Avatar,
  },
  props: {
    /**
     * User object (we need name & avatar)
     */
    user: {
      type: Object,
      default: function () {
        return {};
      },
    },
    /**
     * Color of arrow & box
     */
    color: {
      type: String,
      default: '#000',
    },
  },
  computed: {
    ...mapGetters({
      userAvatar: 'users/getUserAvatarUrl',
    }),
  },
};
</script>

<style lang="stylus" scoped>
.user-cursor-wrapper
    display flex
    flex-direction row
    align-items center

.arrow
    transform translate(-3px, -3px)

.badge
    display flex
    flex-direction row
    padding 4px
    border-radius 4px
    color white
    width fit-content
    transform translate(-8px, 18px)

    &__avatar
        border-radius 2px
        overflow hidden

    &__name
        font-size 10px
        line-height 12px
        margin-left 4px
</style>
