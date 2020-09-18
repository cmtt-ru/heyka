<template>
  <div
    :key="user.microphone + channelId"
    v-popover.mouse.click="{name: 'UserInChannel', data: {userId: user.id, microphone: user.microphone, channelId}}"
    class="user"
  >
    <avatar
      class="user__avatar"
      :image="userAvatar(user.id, 24)"
      :size="24"
      :user-id="user.id"
      :mic="user.microphone"
      :onair="user.speaking"
    />

    <div
      :key="user.name"
      v-textfade
      class="user__name"
    >
      {{ user.name }}
    </div>

    <div class="user__statuses">
      <svg-icon
        v-for="icon in iconArray"
        :key="icon"
        class="user__statuses__icon"
        :name="icon"
        size="small"
      />
    </div>

    <ui-button
      v-if="user.screen"
      v-stop-propagation
      class="user__sharing"
      :type="7"
      size="small"
      icon="cast"
      @click="expandHandler"
    />
  </div>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import { mapGetters } from 'vuex';

const ICON_MAP = {
  mic: 'mic-off',
  headphones: 'headphones-off',
  admin: 'admin',
};

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

    /**
     * Channel id
     */
    channelId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {

    };
  },
  computed: {
    ...mapGetters({
      userAvatar: 'users/getUserAvatarUrl',
    }),

    /**
     * Prepare status icons
     * @returns {array} array of small icons with statuses
     */
    iconArray() {
      const icons = [];

      if (this.user.role === 'admin') {
        icons.push(ICON_MAP['admin']);
      }
      if (this.user.microphone === false) {
        icons.push(ICON_MAP['mic']);
      }
      if (this.user.speakers === false) {
        icons.push(ICON_MAP['headphones']);
      }

      return icons;
    },

  },

  methods: {
    expandHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid-expand', this.user.id);
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

    &:hover,
    &.context-menu--opened
        background-color var(--item-bg-hover)

    &__avatar
        flex-shrink 0

    &__name
        padding-left 8px
        flex-shrink 2
        white-space nowrap
        overflow hidden

    &__statuses
        flex-shrink 0

        &__icon
            padding-left 4px

    &__sharing
        flex-shrink 0
        margin-left auto
        margin-right 4px
        order 2
        color var(--color-2)
</style>
