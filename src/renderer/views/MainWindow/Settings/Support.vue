<template>
  <div class="settings-page">
    <div class="settings__label">
      {{ texts.title }}
    </div>

    <p class="text">
      {{ texts.text }}
    </p>

    <div class="l-mt-24">
      <ui-button
        :type="1"
        @click="openReportPage"
      >
        {{ texts.report }}
      </ui-button>

      <ui-button
        :type="17"
        class="l-ml-8"
        @click="openLogs"
      >
        {{ texts.logs }}
      </ui-button>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

export default {

  components: {
    UiButton,
  },

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
    openReportPage() {
      window.open('https://cmtt-ru.slack.com/archives/CLA674QEN');
      window.ipcRenderer.send('log-manager-send');
    },

    openLogs() {
      window.ipcRenderer.send('log-manager-open-logs');
    },
  },

};
</script>

<style scoped lang="stylus">
@import './styles'
.text
  font-weight: 400

.about-link
  padding-top 12px
  color var(--new-UI-01)

</style>
