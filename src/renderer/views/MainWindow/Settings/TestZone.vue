import {ipcRenderer} from "electron";
<template>
  <div class="settings-page">
    <ui-button
      :type="1"
      size="small"
      class="l-mr-8"
      @click="openWebrtcInternals"
    >
      Open WebRTC Internals
    </ui-button>
    <br><br>
    <router-link :to="{name: 'drawing'}">
      Рисование
    </router-link>

    <p class="settings__label">
      Frame window
    </p>
    <ui-button
      :type="1"
      size="small"
      class="l-mr-8"
      @click="openFrameWindow"
    >
      Open
    </ui-button>

    <ui-button
      :type="1"
      size="small"
      class="l-mr-8"
      @click="closeFrameWindow"
    >
      Close
    </ui-button>

    <ui-button
      :type="1"
      size="small"
      class="l-mr-8"
      @click="openFrameWindowConsole"
    >
      Console
    </ui-button>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import callWindow from '@classes/callWindow';
import { ipcRenderer } from 'electron';

export default {
  components: {
    UiButton,
  },
  data() {
    return {

    };
  },
  created() {

  },
  methods: {
    openWebrtcInternals() {
      ipcRenderer.sendSync('open-webrtc-internals');
    },

    openFrameWindow() {
      callWindow.showFrame();
    },

    closeFrameWindow() {
      callWindow.closeFrame();
    },

    openFrameWindowConsole() {
      callWindow.showFrameConsole();
    },
  },
};
</script>

<style scoped lang="stylus">
  @import './styles'
</style>
