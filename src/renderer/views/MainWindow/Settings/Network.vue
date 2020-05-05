<template>
  <div class="settings-page">
    <div class="privacy-text">{{ texts.transparency }}</div>
    <textarea readonly cols="30" rows="10" v-model="privacyLogs"></textarea>
    <div class="settings__label">{{ texts.googleLabel }}</div>
    <ui-switch @input="save('Analytics', analytics)" v-model="analytics" :text="texts.googleSwitch"/>
  </div>
</template>

<script>

import { UiSwitch } from '@components/Form';

export default {
  components: {
    UiSwitch,
  },
  data() {
    return {
      analytics: this.$store.state.app.collectAnalytics,
    };
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.network');
    },

    privacyLogs() {
      return this.$store.state.app.privacyLogs.join('\n');
    },
  },

  methods: {
    /**
     * Initiate state mutation
     * @param {string} field Field to mutate. Should be part of "set___"-action name
     * @param {any} value value to update state with
     * @returns {void}
     */
    save(field, value) {
      this.$store.dispatch(`app/set${field}`, value);
    },
  },
};
</script>

<style scoped lang="stylus">
@import './styles'

.settings-page
  padding 8px 20px 12px

.privacy-text
  line-height 22px

textarea
  outline none
  resize none
  background-color var(--input)
  border 0.5px solid var(--stroke-3)
  color var(--text-1)
  border-radius 4px
  margin-top 14px
  padding 8px 12px 16px
  width 100%
  box-sizing border-box
  font-family monospace
  font-size 12px
  line-height 20px
  white-space pre

</style>
