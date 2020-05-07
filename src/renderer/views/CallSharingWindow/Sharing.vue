<template>
  <div class="sharing-window">

    <div class="sharing-window__header">
      <span class="sharing-window__title">Sharing</span>
      <ui-button
        class="sharing-window__close"
        :type="7"
        size="small"
        icon="close">
      </ui-button>
    </div>

    <div class="sharing-window__content">

      <div class="sharing-window__options">
        <ui-button class="l-mr-8" :type="3" size="small">Screen</ui-button>
        <ui-button class="l-mr-8" :type="3" size="small">Camera</ui-button>
        <ui-button class="l-mr-8" :type="3" size="small">Screen and camera</ui-button>
        <ui-button class="l-mr-8" :type="3" size="small">Window</ui-button>
      </div>

      <div class="sharing-window__sources">
        <img
          v-for="source in sources"
          :src="source.thumbnail.toDataURL()"
          :key="source.id"
          :class="{active: source.id === selectedSource.id}"
          @click="handleSource(source)"
        >
      </div>

      <video ref="video"></video>

    </div>

    <div class="sharing-window__footer">

      <ui-button
        v-if="!isSharingEnabled"
        class="l-mr-8"
        :type="1"
      >Start sharing</ui-button>

      <ui-button
        v-if="isSharingEnabled"
        class="l-mr-8"
        :type="12"
      >Stop sharing</ui-button>

      <ui-button :type="8">Cancel</ui-button>
    </div>

  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { desktopCapturer } from 'electron';

export default {
  components: {
    UiButton,
  },

  data() {
    return {
      sources: [],
      selectedSource: {},
    };
  },

  methods: {
    async updateSources() {
      this.sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    },

    async handleSource(source) {
      this.selectedSource = source;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720,
            },
          },
        });

        this.$refs.video.srcObject = stream;
        this.$refs.video.onloadedmetadata = (e) => this.$refs.video.play();
      } catch (e) {
        console.log(e);
      }
    },
  },

  computed: {
    isSharingEnabled() {
      return this.mediaState.screen === true || this.mediaState.camera === true;
    },

    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },
  },

  async mounted() {
    this.updateSources();
  },
};
</script>

<style lang="stylus" scoped>
  .sharing-window
    display flex
    flex-direction column
    padding 20px
    height 100vh
    box-sizing border-box

    &__header
      display flex
      margin-bottom 16px
      align-items center

    &__close
      margin-left auto

    &__footer
      margin-top auto

    &__sources
      display flex
      flex-wrap wrap
      align-items: center
      margin-top 12px

      img
        border 2px solid var(--color-4)
        margin 0 8px 8px 0
        border-radius 4px
        width 75px

        &.active
          border-color var(--color-2)
        /*object-fit cover*/

</style>
