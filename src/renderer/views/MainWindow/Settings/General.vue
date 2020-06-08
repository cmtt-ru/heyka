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
      v-model="mode"
      :data="modes"
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
  </div>
</template>

<script>

import { UiSelect, UiSwitch } from '@components/Form';
import broadcastEvents from '@classes/broadcastEvents';

export default {
  components: {
    UiSwitch,
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
     */
    mode: {
      get() {
        return this.$store.state.app.runAppFrom;
      },
      set(value) {
        this.$store.dispatch('app/setMode', value);
      },
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

};
</script>

<style scoped lang="stylus">
@import './styles'

.extra-info
  font-size 10px
  line-height 10px
  color var(--text-1)

</style>