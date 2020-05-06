<template>
  <div class="settings-page">

    <div class="settings__label">{{texts.speakersLabel}}</div>
    <div class="setting-with-icon">
      <ui-select v-model="selectedDevices.speaker" :data="devices.speakers"/>
      <ui-button :type="7" size="medium" height="32" icon="sound" @click.native="playTestSound"/>
    </div>

    <div class="settings__label">{{texts.micLabel}}</div>
    <ui-select v-model="selectedDevices.microphone" :data="devices.microphones"/>
    <progress-bar class="l-mt-8" :value="microphoneVolume"></progress-bar>

    <div class="settings__label">{{texts.cameraLabel}}</div>
    <ui-select v-model="selectedDevices.camera" :data="devices.cameras"/>

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
      selectedDevices: { ...this.$store.getters['app/getSelectedDevices'] },
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
  },

  mounted() {
    this.changeDevice();
  },

  destroyed() {
    this.destroyMediaStream();
  },

  watch: {
    selectedDevices: {
      handler() {
        this.$store.dispatch('app/setSelectedDevices', { ...this.selectedDevices });
        this.changeDevice();
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
