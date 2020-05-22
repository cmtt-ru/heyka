<template>
  <div class="settings-page">
    <div class="settings__label">
      {{ texts.speakersLabel }}
    </div>
    <div class="setting-with-icon">
      <ui-select
        v-model="selectedSpeaker"
        :data="devices.speakers"
      />
      <ui-button
        :type="7"
        size="medium"
        height="32"
        icon="sound"
        @click.native="playTestSound"
      />
    </div>

    <div class="settings__label">
      {{ texts.micLabel }}
    </div>
    <ui-select
      v-model="selectedMicrophone"
      :data="devices.microphones"
    />
    <progress-bar
      class="l-mt-8"
      :value="microphoneVolume"
    />

    <div class="settings__label">
      {{ texts.cameraLabel }}
    </div>
    <ui-select
      v-model="selectedCamera"
      :data="devices.cameras"
    />
  </div>
</template>

<script>

import UiButton from '@components/UiButton';
import { UiSelect } from '@components/Form';
import ProgressBar from '@components/ProgressBar';
import hark from 'hark';

/**
 * DB compensator
 * @type {number}
 */
const DB_COMPENSATOR = 100;

/**
 * Audio element for audio test
 * @type {HTMLAudioElement}
 */
const audioTest = new Audio(require('@assets/audio/test-sound.mp3'));

let mediaStream = null;
let harkInstance = null;

export default {
  components: {
    UiSelect,
    UiButton,
    ProgressBar,
  },

  data() {
    return {
      microphoneVolume: 0,
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
     * @returns {object}
     */
    devices() {
      return this.$store.getters['app/getDevices'];
    },

    /**
     * List of selected devices
     * @returns {object}
     */
    selectedDevices() {
      return this.$store.getters['app/getSelectedDevices'];
    },

    /**
     * Selected speaker model
     */
    selectedSpeaker: {
      get() {
        return this.selectedDevices.speaker;
      },
      set(value) {
        this.selectDevice('speaker', value);
      },
    },

    /**
     * Selected microphone model
     */
    selectedMicrophone: {
      get() {
        return this.selectedDevices.microphone;
      },
      set(value) {
        this.selectDevice('microphone', value);
      },
    },

    /**
     * Selected camera model
     */
    selectedCamera: {
      get() {
        return this.selectedDevices.camera;
      },
      set(value) {
        this.selectDevice('camera', value);
      },
    },
  },

  mounted() {
    this.changeDevice();
  },

  destroyed() {
    this.destroyMediaStream();
  },

  methods: {
    /**
     * Play test sound
     * @returns {void}
     */
    playTestSound() {
      audioTest.play();
    },

    /**
     * Change's device for test sound and microphone volume test
     * @return {void}
     */
    async changeDevice() {
      this.destroyMediaStream();

      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: this.selectedDevices.microphone,
        },
      });

      audioTest.setSinkId(this.selectedDevices.speaker);

      harkInstance = hark(mediaStream, {});

      harkInstance.on('volume_change', (db) => {
        this.microphoneVolume = db + DB_COMPENSATOR;
      });
    },

    /**
     * Destroy's hark instance and media stream
     * @returns {void}
     */
    destroyMediaStream() {
      if (harkInstance) {
        harkInstance.stop();
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    },

    /**
     * Save selected devices
     * @param {string} device – device type
     * @param {string} deviceId – device id
     * @returns {void}
     */
    selectDevice(device, deviceId) {
      const data = { ...this.selectedDevices };

      data[device] = deviceId;

      this.$store.dispatch('app/setSelectedDevices', data);
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
