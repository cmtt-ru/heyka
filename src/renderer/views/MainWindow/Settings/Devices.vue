<template>
  <div class="settings-page">
    <div class="settings__label">{{texts.speakersLabel}}</div>
    <div class="setting-with-icon">
      <ui-select v-model="selectedDevices.speaker" :data="devices.speakers"/>
      <ui-button :type="7" size="medium" height="32" icon="sound"/>
    </div>
    <div class="settings__label">{{texts.micLabel}}</div>
    <ui-select v-model="selectedDevices.microphone" :data="devices.microphones"/>
    <div class="settings__label">{{texts.cameraLabel}}</div>
    <ui-select v-model="selectedDevices.camera" :data="devices.cameras"/>
  </div>
</template>

<script>

import UiButton from '@components/UiButton';
import { UiSelect } from '@components/Form';

export default {
  components: {
    // UiSwitch,
    UiSelect,
    // UiInput,
    UiButton,
  },

  data() {
    return {
      selectedDevices: { ...this.$store.getters['app/getSelectedDevices'] },
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.devices');
    },

    /**
     * Device list
     * @return {object}
     */
    devices() {
      return this.$store.getters['app/getDevices'];
    },
  },

  watch: {
    selectedDevices: {
      handler() {
        this.$store.dispatch('app/setSelectedDevices', { ...this.selectedDevices });
      },
      deep: true,
    },
  },

};
</script>

<style scoped lang="stylus">
@import './styles'

.setting-with-icon
  display flex
  flex-direction row
  justify-content stretch
  align-items center

  & .dropdown
    flex-grow 1

  & .ui-button
    flex-shrink 0
    margin-left 8px
    border 1px solid var(--stroke-3)
</style>
