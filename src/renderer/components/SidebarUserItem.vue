<template>
    <router-link :to="'/main-window/workspace/user/'+user.id" class="user" :class="{'user--offline': isOffline}">

        <avatar class="user__avatar" :image="user.avatar" :size="14"></avatar>

        <div v-textfade :key="user.name" class="user__name">{{user.name}}</div>

        <ui-button
            :type="7"
            class="user__more"
            size="small"
            height="16"
            @click.native="$emit('more')"
            icon="more">
        </ui-button>

    </router-link>
</template>

<script>
import Avatar from '@components/Avatar';
import UiButton from '@components/UiButton';

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

  computed: {
    isOffline() {
      return this.user.onlineStatus === 'offline';
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

    &__avatar
        flex-shrink 0
        margin 1px

    &__name
        padding-left 4px
        flex-grow 1

    &__more
        margin-left 4px

.router-link-active
    background-color var(--item-bg-active)
    opacity 1
</style>
