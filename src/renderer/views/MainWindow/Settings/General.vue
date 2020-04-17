<template>
  <div class="settings">
    <div class="settings__label">Language</div>
    <ui-select v-model="general.language" :data="languages"/>
    <div class="settings__label">Run app from</div>
    <ui-select v-model="general.mode" :data="modes"/>
    <div class="settings__label">Autorun</div>
    <ui-switch v-model="general.autorun" text="Run at startup"/>
    <div class="settings__label">Appearance</div>
    <ui-select v-model="general.theme" :data="themes" :disabled="general.autoTheme"/>
    <ui-switch v-model="general.autoTheme" text="Automatically"/>
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
      general: {
        language: 'English',
        mode: 'Windowed',
        autorun: true,
        theme: 'Light',
        autoTheme: false,
      },
      languages: [
        {
          name: 'English',
          value: 'English',
        },
        {
          name: 'Русский',
          value: 'Русский',
        },
      ],
      modes: [
        {
          name: 'Windowed',
          value: 'Windowed',
        },
        {
          name: 'Tray',
          value: 'Tray',
        },
      ],
      themes: [
        {
          name: 'Light',
          value: 'Light',
        },
        {
          name: 'Dark',
          value: 'Dark',
        },
      ],
    };
  },

  methods: {

  },
};
</script>

<style scoped lang="stylus">

</style>