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
    mode: function (newMode, oldMode) {
      this.$store.dispatch('app/setMode', this.mode);
    },
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.general');
    },
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
    modeWillChange() {
      return this.$store.getters['app/getOldMode'] !== this.$store.getters['app/getMode'];
    },
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
    saveTheme() {
      this.$store.dispatch('app/setTheme', { ...this.theme });
    },
    saveLanguage() {
      this.$store.dispatch('app/setLanguage', this.language);
    },
    saveAutorun() {
      this.$store.dispatch('app/setAutorun', this.autorun);
    },
  },

  created() {
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