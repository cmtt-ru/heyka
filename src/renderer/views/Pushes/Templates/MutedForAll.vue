<template>
  <div class="push__content">
    <svg-icon
      name="mic-off"
      size="large"
    />
    <p>{{ texts.text }}<br>{{ user.name }}</p>

    <ui-button
      :type="1"
      @click="$emit('buttonClick')"
    >
      {{ texts.close }}
    </ui-button>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
  },
  props: {
    /**
     * External data
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
      return this.$t('push.mutedForAll');
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
    align-items center
    padding-left 12px

    p
      flex 1 0 auto
      margin-left 12px
</style>
