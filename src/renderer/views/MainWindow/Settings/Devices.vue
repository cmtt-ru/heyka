<template>
  <div class="settings-page">
    <div class="settings__label">{{texts.speakersLabel}}</div>
    <div class="setting-with-icon">
      <ui-select v-model="general.speaker" :data="devices.speakers"/>
      <ui-button :type="7" size="medium" height="32" icon="sound"/>
    </div>
    <div class="settings__label">{{texts.micLabel}}</div>
    <ui-select v-model="general.mic" :data="devices.microphones"/>
    <div class="settings__label">{{texts.cameraLabel}}</div>
    <ui-select v-model="general.camera" :data="devices.webcams"/>
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
      general: {
        speaker: '1',
        mic: '1',
        camera: '1',
      },
      devices: {
        speakers: [],
        microphones: [],
        webcams: [],
      },

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
  },

  methods: {
    gotDevices(deviceInfos) {
      for (const device of deviceInfos) {
        // console.log(device);
        if (device.kind === 'audioinput') {
          this.devices.mics.push({
            name: device.label,
            value: device.deviceId,
          });
        } else if (device.kind === 'audiooutput') {
          this.devices.speakers.push({
            name: device.label,
            value: device.deviceId,
          });
        } else if (device.kind === 'videoinput') {
          this.devices.cameras.push({
            name: device.label,
            value: device.deviceId,
          });
        }
      }
    },
  },

  created() {
    this.devices = this.$store.getters['app/getDevices'];
    // navigator.mediaDevices.enumerateDevices().then(this.gotDevices);
  },
};
</script>

<style scoped lang="stylus">
@import './settings'

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