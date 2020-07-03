<template>
  <div class="doggy">
    <div class="doggy__inner">
      <p>{{ texts.empty }}</p>
      <router-link :to="{name: 'drawing'}">
        Рисование
      </router-link>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
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
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    console.log('IS_DEV:', IS_DEV, ', IS_MAC:', IS_MAC, ', IS_WIN:', IS_WIN, ', IS_LINUX:', IS_LINUX);
  },
};
</script>

<style scoped lang="stylus">
  .doggy
    display flex
    text-align center
    height 100%
    width 100%
    align-items center
    justify-content center

    &__inner
      margin-top -20px

    p
      color var(--text-1)
      white-space pre
      margin-top 10px
      line-height 20px
</style>
