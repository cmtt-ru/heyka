<template>
  <router-link
    :to="'/main-window/workspace/user/'+user.id"
    class="user"
    :class="{'user--offline': isOffline}"
  >
    <avatar
      class="user__avatar"
      :image="userAvatar(user.id, 14)"
      :status="isStrangeStatus"
      :user-id="user.id"
      :size="14"
    />

    <div
      :key="user.name"
      v-textfade
      class="user__name"
    >
      {{ user.name }}
    </div>

    <ui-button
      v-show="isSelected"
      :type="7"
      class="user__more"
      size="small"
      height="16"
      icon="more"
      @click="moreHandler"
    />
  </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';

export default {
  components: {
    Avatar,
    UiButton,
  },
  props: {
    /**
     * Object with full user info (id, name, avatar, statuses)
     */
    user: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },

  computed: {
    ...mapGetters({
      userAvatar: 'users/getUserAvatarUrl',
    }),

    /**
     * Return true if this user is currently offline
     * @returns {boolean}
     */
    isOffline() {
      return this.user.onlineStatus === 'offline';
    },

    /**
     * We need to display user status if he is not online or oflline (idle, busy, etc.)
     * @returns {string|null}
     */
    isStrangeStatus() {
      if (this.user.onlineStatus !== 'online' && this.user.onlineStatus !== 'offline') {
        return this.user.onlineStatus;
      }

      return null;
    },

    /**
     * Return true if this user's page is currently opened
     * @returns {boolean}
     */
    isSelected() {
      return this.$route.params.id === this.user.id;
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
.user
    display flex
    flex-direction row
    justify-content flex-start
    align-items center
    padding 4px
    margin 2px 0
    width 100%
    border-radius 4px

    &:hover
        background-color var(--item-bg-hover)
        opacity 1

    &--offline
        opacity 0.5
        filter grayscale(1)

        &:hover
          background-color var(--item-bg-hover)
          opacity 0.8

    &__avatar
        flex-shrink 0
        margin 1px

    &__name
        padding-left 4px
        flex-grow 1
        line-height 16px

    &__more
        margin-left 4px

.router-link-active
    background-color var(--item-bg-active)
    opacity 1
    box-shadow 0px 1px 2px rgba(0, 0, 0, 0.1)
</style>
