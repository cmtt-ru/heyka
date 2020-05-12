<template>
  <div class="settings-page">
    <div class="settings__label">
      {{ texts.languageLabel }}
    </div>
    <ui-select
      v-model="language"
      :data="languages"
      @input="save('Language', language)"
    />
    <div class="settings__label">
      {{ texts.behaviourLabel }}
    </div>
    <ui-select
      v-model="mode"
      :data="modes"
      @input="save('Mode', mode)"
    />
    <div
      v-if="modeWillChange"
      class="extra-info"
    >
      {{ texts.behaviourWillChange }}
    </div>
    <div class="settings__label">
      {{ texts.autorunLabel }}
    </div>
    <ui-switch
      v-model="autorun"
      :text="texts.autorunSwitch"
      @input="save('Autorun', autorun)"
    />
    <div class="settings__label">
      {{ texts.appearanceLabel }}
    </div>
    <ui-select
      v-model="theme.name"
      :data="themes"
      :disabled="theme.auto"
      @input="save('Theme', {...theme})"
    />
    <ui-switch
      v-model="theme.auto"
      :text="texts.automaticallySwitch"
      @input="save('Theme', {...theme})"
    />
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
      // ? maybe move to i18n module?
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

.extra-info
  font-size 10px
  line-height 10px
  color var(--text-1)

</style>