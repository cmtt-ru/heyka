<template>
  <div class="empty-message">
    <div class="empty-message__inner">
      <p>{{ texts.empty }}</p>
      <router-link :to="{name: 'drawing'}">
        Рисование
      </router-link>
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
import { ipcRenderer } from 'electron';
import Logger from '@classes/logger';
import { CHANGELOG } from '@/changelog';
const cnsl = new Logger('Empty.vue', '#16A085');

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
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    cnsl.log('IS_DEV:', IS_DEV, ', IS_MAC:', IS_MAC, ', IS_WIN:', IS_WIN, ', IS_LINUX:', IS_LINUX);
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
    color var(--text-1)

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
