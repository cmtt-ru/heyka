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
    <ui-button
      :type="1"
      size="small"
      class="l-mr-8"
      @click="openChromeTracing"
    >
      Open Chrome Tracing
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
      window.ipcRenderer.invoke('open-webrtc-internals');
    },

    openChromeTracing() {
      window.ipcRenderer.invoke('open-chrome-tracing');
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

  .face-detection
    video
      width 240px
      height 180px
      background black
</style>
