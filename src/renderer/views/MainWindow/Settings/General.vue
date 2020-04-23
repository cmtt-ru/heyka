<template>
  <div class="settings-page">
    <div class="settings__label">{{texts.languageLabel}}</div>
    <ui-select v-model="language" :data="languages"/>
    <div class="settings__label">{{texts.behaviourLabel}}</div>
    <ui-select v-model="mode" :data="modes"/>
    <div class="extra-info" v-if="modeWillChange">{{texts.behaviourWillChange}}</div>
    <div class="settings__label">{{texts.autorunLabel}}</div>
    <ui-switch v-model="autorun" :text="texts.autorunSwitch"/>
    <div class="settings__label">{{texts.appearanceLabel}}</div>
    <ui-select v-model="theme.name" :data="themes" :disabled="theme.auto"/>
    <ui-switch v-model="theme.auto" :text="texts.automaticallySwitch"/>
  </div>
</template>

<script>

import { UiSelect, UiSwitch } from '@components/Form';

export default {
  components: {
    UiSwitch,
    UiSelect,
  },

  data() {
    return {
      mode: null,
      language: null,
      autorun: null,
      theme: null,
      // Language tag ('en') mapped to normal name ('English').
      //  TODO: move to store maybe?
      languages: [
        {
          name: 'English',
          value: 'en',
        },
        {
          name: 'Русский',
          value: 'ru',
        },
        {
          name: 'God fowgive me',
          value: 'uwu',
        },
      ],

    };
  },

  watch: {
    language: 'saveLanguage',
    'theme.name': 'saveTheme',
    'theme.auto': 'saveTheme',
    autorun: 'saveAutorun',
    mode: 'saveMode',
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.general');
    },
    /**
     * Array for behaviour select
     * @returns {array}
     */
    modes() {
      return [
        {
          name: this.texts.behaviours.window,
          value: 'window',
        },
        {
          name: this.texts.behaviours.tray,
          value: 'tray',
        },
      ];
    },
    /**
     * Flag for "restart app to see changes" text
     * @returns {boolean}
     */
    modeWillChange() {
      return this.$store.getters['app/getOldMode'] !== this.$store.getters['app/getMode'];
    },
    /**
     * Array for theme select
     * @returns {array}
     */
    themes() {
      return [
        {
          name: this.texts.theme.light,
          value: 'light',
        },
        {
          name: this.texts.theme.dark,
          value: 'dark',
        },
      ];
    },
  },

  methods: {
    /**
     * Send theme to vuex
     * @returns {void}
     */
    saveTheme() {
      this.$store.dispatch('app/setTheme', { ...this.theme });
    },
    /**
     * Send language to vuex
     * @returns {void}
     */
    saveLanguage() {
      this.$store.dispatch('app/setLanguage', this.language);
    },
    /**
     * Send autorun state to vuex
     * @returns {void}
     */
    saveAutorun() {
      this.$store.dispatch('app/setAutorun', this.autorun);
    },
    /**
     * Send mode (window/tray) state to vuex
     * @returns {void}
     */
    saveMode() {
      this.$store.dispatch('app/setMode', this.mode);
    },
  },

  created() {
    /* Get all settings from vuex */
    this.language = this.$store.getters['app/getLang'];
    this.theme = this.$store.getters['app/getTheme'];
    this.mode = this.$store.getters['app/getMode'];
    this.autorun = this.$store.getters['app/getAutorun'];
  },
};
</script>

<style scoped lang="stylus">
.extra-info
  font-size 10px
  line-height 10px
  color var(--text-1)

</style>