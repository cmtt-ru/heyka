<template>
  <div class="settings-page">
    <div class="settings__label">
      {{ texts.languageLabel }}
    </div>
    <ui-select
      v-model="language"
      :data="languages"
    />
    <div class="settings__label">
      {{ texts.behaviourLabel }}
    </div>
    <ui-select
      v-model="localSettings.mode"
      :data="modes"
    />
    <div
      v-if="settingsWillChange"
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
    />
    <div class="settings__label">
      {{ texts.appearanceLabel }}
    </div>
    <ui-select
      v-model="themeName"
      :data="themes"
      :disabled="themeAuto"
    />
    <ui-switch
      v-model="themeAuto"
      :text="texts.automaticallySwitch"
    />
    <br>

    <details class="expand">
      <summary class="expand__header">
        {{ texts.advanced }}
      </summary>
      <ui-switch
        v-model="localSettings.resizeWindow"
        :text="texts.resize"
      />
      <div
        v-if="settingsWillChange"
        class="extra-info"
      >
        {{ texts.behaviourWillChange }}
      </div>
      <ui-switch
        v-model="themeAuto"
        :text="texts.nomic"
      />
      <ui-switch
        v-model="themeAuto"
        :text="texts.closeOverlay"
      />
    </details>

    <div
      class="restart-container"
    >
      <ui-button
        :type="1"
        @click="restartHandler"
      >
        {{ texts.restartNow }}
      </ui-button>
    </div>
  </div>
</template>

<script>

import { UiSelect, UiSwitch } from '@components/Form';
import UiButton from '@components/UiButton';
import broadcastEvents from '@classes/broadcastEvents';
import { ipcRenderer } from 'electron';
import { heykaStore } from '@/store/localStore';

export default {
  components: {
    UiSwitch,
    UiSelect,
    UiButton,
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
      },

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
     * Flag for "restart app to see changes" text
     * @returns {boolean}
     */
    settingsWillChange() {
      return (this.localSettings.mode !== this.mode) || (this.localSettings.resizeWindow !== this.resizeWindow);
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

  watch: {
    mode(val) {
      this.$set(this.localSettings, 'mode', val);
    },

    resizeWindow(val) {
      this.$set(this.localSettings, 'resizeWindow', val);
    },
  },

  methods: {
    restartHandler() {
      heykaStore.set('runAppFrom', this.localSettings.mode);
      heykaStore.set('resizeWindow', this.localSettings.resizeWindow);
      ipcRenderer.send('remote-restart');
    },
  },

};
</script>

<style scoped lang="stylus">
@import './styles'

.settings-page
  min-height calc(100vh - 52px)
  display flex
  flex-direction column

.extra-info
  font-size 10px
  line-height 10px
  color var(--text-1)

.expand

  &__header
    cursor pointer
    padding 6px 8px 8px
    border-radius 4px
    border-top 2px solid var(--line-stroke)
    text-align center
    margin-bottom 20px

    &::-webkit-details-marker {
      display none
    }

    &:hover
      background-color var(--button-bg-4)

.restart-container
  flex-grow 2
  display flex
  flex-direction column
  justify-content flex-end
  align-items flex-start

</style>