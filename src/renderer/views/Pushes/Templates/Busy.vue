<template>
  <div>
    <div class="push__content">
      <avatar
        class="push__avatar"
        :size="40"
        :image="user.avatar"
      />

      <div class="push__col">
        <p class="push__user-name">
          {{ user.name }}
        </p>

        <div class="push__channel">
          {{ texts.isbusy }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from '@components/Avatar';

export default {
  components: {
    Avatar,
  },
  props: {
    /**
      * Inner data with "user", "channel" and "buttons"
    */
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('push');
    },
    /**
     * Get user's info
     * @returns {object}
     */
    user() {
      return this.$store.getters['users/getUserById'](this.data.userId);
    },

  },
};
</script>

<style  lang="stylus" scoped>

.push

  &__content
    display flex

  &__col
      margin-left 8px

  &__avatar
    display block
    width 40px
    height 40px
    border-radius 4px
    flex-shrink 0

  &__user-name
    margin-top 3px
    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  &__channel
    display flex
    align-items center
    color var(--text-1)
    align-items center
    font-size 12px
    line-height 14px
    margin-top 1px
    flex-shrink 0
    white-space nowrap

    &__icon
      margin-left 4px

  &__button-wrapper
    flex-shrink 0
    flex-grow 0
    margin-left 8px

  &__button
    margin 0 4px

</style>