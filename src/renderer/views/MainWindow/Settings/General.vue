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
    <ui-select v-model="theme" :data="themes" :disabled="autoTheme"/>
    <ui-switch v-model="autoTheme" :text="texts.automaticallySwitch"/>
  </div>
</template>

<script>

import { UiSelect, UiSwitch } from '@components/Form';
import { ipcRenderer } from 'electron';

export default {
  components: {
    UiSwitch,
    UiSelect,
  },

  data() {
    return {
      mode: null,
      language: null,
      modeWillChange: false,
      autorun: true,
      theme: 'light',
      autoTheme: false,

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
    language(newLang, oldLang) {
      this.$i18n.locale = newLang;
      this.$store.dispatch('app/setLanguage', newLang);
    },
    theme(newTheme, oldTheme) {
      this.$themes.manualSetTheme(newTheme);
    },
    mode(newMode, oldMode) {
      ipcRenderer.send('tray-manager-toggle', newMode);
    },
    autoTheme(newVal, oldVal) {
      if (newVal) {
        this.$themes.autoSetTheme(newVal);
      } else {
        this.$themes.manualSetTheme(this.theme);
      }
    },
  },

  computed: {
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

  },
  created() {
    this.language = this.$store.getters['app/getLang'];
    this.theme = this.$themes.getCurrentTheme();
    this.autoTheme = this.$themes.getCurrentAuto();
    ipcRenderer.invoke('tray-manager-get-mode').then((result) => {
      this.mode = result;
    });

    ipcRenderer.on('tray-manager-will-change', (event, arg) => {
      this.modeWillChange = arg;
    });
  },
};
</script>

<style scoped lang="stylus">
.extra-info
  font-size 10px
  line-height 10px
  color var(--text-1)

</style>