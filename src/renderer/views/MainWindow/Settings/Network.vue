<template>
  <div class="settings-page">
    <div class="settings__label">
      {{ texts.transparencyCategory }}
    </div>
    <div class="privacy-text">
      {{ texts.transparency }}
    </div>
    <textarea
      v-model="privacyLogs"
      class="scroll scroll--vh"
      readonly
      cols="30"
      rows="10"
    />
    <!-- <div class="settings__label">
      {{ texts.googleCategory }}
    </div>
    <ui-switch
      v-model="analytics"
      :text="texts.googleLabel"
      @input="save('Analytics', analytics)"
    /> -->
  </div>
</template>

<script>

// import { UiSwitch } from '@components/Form';

export default {
  components: {
    // UiSwitch,
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

    /**
     * Privacy logs in string format
     * @returns {string}
     */
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

.privacy-text
  line-height 22px
  font-weight 400

textarea
  outline none
  resize none
  background var(--Background-grey)
  border 0.5px solid var(--UI-divider-1)
  color var(--Text-primary)
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
