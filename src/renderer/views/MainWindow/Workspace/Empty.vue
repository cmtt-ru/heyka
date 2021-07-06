<template>
  <div class="empty-message">
    <div class="empty-message__inner">
      <svg-icon
        class="empty-message__doggo"
        name="doggo"
        width="100"
        height="81"
      />
      <p>{{ texts.empty }}</p>
    </div>

    <div class="changelog">
      <div>{{ CHANGELOG[0].version }}.</div>
      <router-link
        :to="{name: 'settings-about'}"
        class="changelog__link"
      >
        {{ texts.new }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { CHANGELOG } from '@/changelog';

export default {
  data() {
    return {
      CHANGELOG,
    };
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace');
    },
  },
  mounted() {
    window.ipcRenderer.send('page-rendered', 'Hello from Main!');
  },
};
</script>

<style scoped lang="stylus">
  .empty-message
    display flex
    flex-direction column
    text-align center
    width 100%
    height 100%
    position relative
    align-items center
    justify-content center
    color var(--Text-secondary)
    white-space pre-line

    &__inner
      margin-bottom 88px

    &__doggo
      margin-bottom 14px
      color var(--Text-secondary)

  .changelog
    position absolute
    bottom 12px
    display flex
    flex-direction row
    align-items center
    justify-content center

    &__link
      margin-left 4px
      text-decoration underline

</style>
