<template>
    <div class="user">

        <avatar class="user__avatar" :size="24" :onair="user.onair"></avatar>

        <div v-textfade :key="user.name" class="user__name">{{user.name}}</div>

        <div class="user__statuses">
            <svg-icon
                v-for="icon in iconArray"
                :key="icon"
                class="user__statuses__icon"
                :name="icon"
                size="small"
            ></svg-icon>
        </div>

        <ui-button
            v-if="user.sharing"
            class="user__sharing"
            :type="7"
            size="small"
            icon="cast">
        </ui-button>

    </div>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';

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
    user: Object,
  },
  data() {
    return {

    };
  },
  computed: {

    /**
     * Prepare status icons
     * @returns {Array} array of small icons with statuses
     */
    iconArray() {
      const icons = [];

      if (this.user.admin === true) {
        icons.push(ICON_MAP['admin']);
      }
      if (this.user.mic === false) {
        icons.push(ICON_MAP['mic']);
      }
      if (this.user.headphones === false) {
        icons.push(ICON_MAP['headphones']);
      }

      return icons;
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
