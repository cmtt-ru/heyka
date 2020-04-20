<template>
  <div class="settings-page">
    <div class="settings__label">Speakers</div>
    <div class="setting-with-icon">
      <ui-select v-model="general.speaker" :data="speakers"/>
      <ui-button :type="7" size="medium" height="32" icon="sound"/>
    </div>
    <div class="settings__label">Microphone</div>
    <ui-select v-model="general.mic" :data="mics"/>
    <div class="settings__label">Camera</div>
    <ui-select v-model="general.camera" :data="cameras"/>
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
        speaker: '',
        mic: '',
        camera: '',
      },
      speakers: [],
      mics: [],
      cameras: [],
    };
  },

  methods: {
    gotDevices(deviceInfos) {
      for (const device of deviceInfos) {
        // console.log(device);
        if (device.kind === 'audioinput') {
          this.mics.push({
            name: device.label,
            value: device.deviceId,
          });
        } else if (device.kind === 'audiooutput') {
          this.speakers.push({
            name: device.label,
            value: device.deviceId,
          });
        } else if (device.kind === 'videoinput') {
          this.cameras.push({
            name: device.label,
            value: device.deviceId,
          });
        }
      }
    },
  },

  created() {
    navigator.mediaDevices.enumerateDevices()
      .then(this.gotDevices);
  },
};
</script>

<style scoped lang="stylus">
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