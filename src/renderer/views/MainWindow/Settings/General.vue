<template>
  <div class="settings-page">
    <div class="settings__label">{{texts.languageLabel}}</div>
    <ui-select @input="save('Language', language)" v-model="language" :data="languages"/>
    <div class="settings__label">{{texts.behaviourLabel}}</div>
    <ui-select @input="save('Mode', mode)" v-model="mode" :data="modes"/>
    <div class="extra-info" v-if="modeWillChange">{{texts.behaviourWillChange}}</div>
    <div class="settings__label">{{texts.autorunLabel}}</div>
    <ui-switch @input="save('Autorun', autorun)" v-model="autorun" :text="texts.autorunSwitch"/>
    <div class="settings__label">{{texts.appearanceLabel}}</div>
    <ui-select @input="save('Theme', {...theme})" v-model="theme.name" :data="themes" :disabled="theme.auto"/>
    <ui-switch @input="save('Theme', {...theme})" v-model="theme.auto" :text="texts.automaticallySwitch"/>
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
      mode: this.$store.state.app.runAppFrom,
      language: this.$store.state.app.language,
      autorun: this.$store.state.app.autorun,
      theme: { ...this.$store.state.app.theme },
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
      return this.$store.getters['app/getModeWillChange'];
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
     * Send action to vuex
     *
     *
     * @returns {void}
     */
    save(field, value) {
      this.$store.dispatch(`app/set${field}`, value);
    },
  },
};
</script>

<style scoped lang="stylus">
@import './settings'

.extra-info
  font-size 10px
  line-height 10px
  color var(--text-1)

</style>