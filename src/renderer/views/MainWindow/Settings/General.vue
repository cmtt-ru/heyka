<template>
  <div class="settings-page">
    <!--    <div class="settings__label">-->
    <!--      {{ texts.generalCategory }}-->
    <!--    </div>-->
    <!--    <ui-select-->
    <!--      v-model="language"-->
    <!--      :data="languages"-->
    <!--      :label="texts.languageLabel"-->
    <!--    />-->
    <!-- <ui-select
      v-model="localSettings.mode"
      :data="modes"
      :label="texts.behaviourLabel"
    /> -->
    <!-- <div class="settings__label">
      {{ texts.appearanceCategory }}
    </div>
    <ui-select
      v-model="themeName"
      :data="themes"
      :disabled="themeAuto"
      :label="texts.appearanceLabel"
    />
    <ui-switch
      v-model="themeAuto"
      :text="texts.automaticallySwitch"
    /> -->

    <div class="settings__label">
      {{ texts.autorunCategory }}
    </div>
    <ui-switch
      v-model="autorun"
      :text="texts.autorunSwitch"
    />
    <div class="settings__label">
      {{ texts.advancedCategory }}
    </div>
    <!--    <ui-switch-->
    <!--      v-model="localSettings.resizeWindow"-->
    <!--      :text="texts.resize"-->
    <!--    />-->
    <ui-switch
      v-model="muteMic"
      :text="texts.nomic"
    />
    <ui-switch
      v-model="muteHotkey"
      :text="muteText"
    />

    <div
      class="settings__label"
      hidden
    >
      {{ texts.serverLabel }}
    </div>
    <ui-switch
      v-model="localSettings.devServer"
      style="display: none"
      :text="texts.serverSwitch"
    />
  </div>
</template>

<script>

import { UiSelect, UiSwitch } from '@components/Form';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import { heykaStore } from '@/store/localStore';
import notify from '@libs/notify';

export default {
  components: {
    UiSwitch,
    // eslint-disable-next-line vue/no-unused-components
    UiSelect,
  },

  data() {
    return {
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
      ],

      localSettings: {
        mode: this.$store.state.app.runAppFrom,
        resizeWindow: this.$store.state.app.resizeWindow,
        devServer: this.$store.state.app.devServer,
      },
      devServer: this.$store.state.app.devServer,

      IS_DEV,

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
     * Selected language
     */
    language: {
      get() {
        return this.$store.state.app.language;
      },
      set(value) {
        this.$store.dispatch('app/setLanguage', value);
        broadcastEvents.dispatch('shared-action', {
          action: 'app/setLanguage',
          data: value,
        });
      },
    },

    /**
     * Selected window mode
     *
     * @returns {void}
     */
    mode() {
      return this.$store.state.app.runAppFrom;
    },

    /**
     * Enabled/disabled window resize
     *
     * @returns {void}
     */
    resizeWindow() {
      return this.$store.state.app.resizeWindow;
    },

    /**
     * Selected theme
     */
    theme: {
      get() {
        return { ...this.$store.state.app.theme };
      },
      set(value) {
        this.$store.dispatch('app/setTheme', { ...value });
        broadcastEvents.dispatch('shared-action', {
          action: 'app/setTheme',
          data: { ...value },
        });
      },
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

    themeName: {
      get() {
        return this.theme.name;
      },
      set(value) {
        this.theme = {
          name: value,
          auto: this.themeAuto,
        };
      },
    },

    themeAuto: {
      get() {
        return this.theme.auto;
      },
      set(value) {
        this.theme = {
          name: this.themeName,
          auto: value,
        };
      },
    },

    /**
     * Selected autorun mode
     */
    autorun: {
      get() {
        return this.$store.state.app.autorun;
      },
      set(value) {
        this.$store.dispatch('app/setAutorun', value);
      },
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
     * Mute mic after call?
     */
    muteMic: {
      get() {
        return this.$store.state.app.muteMic;
      },
      set(value) {
        this.$store.dispatch('app/setMuteMic', value);
      },
    },

    /**
     * Mute mic hotkey enable/disable
     */
    muteHotkey: {
      get() {
        return this.$store.state.app.muteHotkey;
      },
      set(value) {
        this.$store.dispatch('app/setMuteHotkey', value);
      },
    },

    muteText() {
      if (IS_MAC) {
        return this.texts.macMuteHotkey;
      }

      return this.texts.muteHotkey;
    },

    /**
     * Flag for "restart app to see changes" text
     * @returns {boolean}
     */
    settingsWillChange() {
      return (this.localSettings.mode !== this.mode) || (this.localSettings.resizeWindow !== this.resizeWindow) || (this.localSettings.devServer !== this.devServer);
    },
  },

  watch: {
    mode(val) {
      this.$set(this.localSettings, 'mode', val);
    },

    resizeWindow(val) {
      this.$set(this.localSettings, 'resizeWindow', val);
    },

    settingsWillChange(val) {
      if (val) {
        this.importantSetting();
      }
    },
  },

  methods: {
    async importantSetting() {
      notify('notifications.importantSetting.text', {
        modal: true,
        buttons: [
          {
            text: 'notifications.importantSetting.yes',
            type: 12,
            action: this.restartHandler,
          },
          {
            text: 'notifications.importantSetting.no',
            close: true,
            action: this.cancelImportantSetting,
          },
        ],
      });
    },

    cancelImportantSetting() {
      this.$set(this.localSettings, 'mode', this.mode);
      this.$set(this.localSettings, 'resizeWindow', this.resizeWindow);
      this.$set(this.localSettings, 'devServer', this.devServer);
    },

    restartHandler() {
      heykaStore.set('runAppFrom', this.localSettings.mode);
      heykaStore.set('resizeWindow', this.localSettings.resizeWindow);
      heykaStore.set('devServer', this.localSettings.devServer);
      heykaStore.set('openPage', 'settings');
      window.ipcRenderer.send('remote-restart');
    },
  },

};
</script>

<style scoped lang="stylus">
@import './styles'

.settings-page
  display flex
  flex-direction column
</style>
