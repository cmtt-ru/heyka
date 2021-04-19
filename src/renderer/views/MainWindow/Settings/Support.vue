<template>
  <div class="settings-page">
    <a
      class="about-link"
      target="_blank"
      @click="sendLogs"
    >{{ texts.tellerror }}</a>
  </div>
</template>

<script>

export default {

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.support');
    },
  },

  methods: {
    sendLogs() {
      window.ipcRenderer.send('log-manager-send');
    },
  },

};
</script>

<style scoped lang="stylus">
@import './styles'

.about-link
  padding-top 12px
  color var(--color-2)
</style>
