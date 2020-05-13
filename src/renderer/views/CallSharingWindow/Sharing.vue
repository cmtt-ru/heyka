<template>
  <div class="sharing-window">

    <div class="sharing-window__header">

      <div class="sharing-window__header__title">
        <span class="sharing-window__title">Sharing preview</span>
        <ui-button
          class="sharing-window__close"
          :type="7"
          size="small"
          icon="close"
          @click="closeHandler"
        />
      </div>

      <div class="sharing-window__options">
        <ui-button
          class="l-mr-8"
          :type="3"
          size="small"
          @click="updateSources('screen')"
        >
          Screen
        </ui-button>

        <ui-button
          class="l-mr-8"
          :type="3"
          size="small"
          @click="updateSources('window')"
        >
          Window
        </ui-button>
      </div>

    </div>

    <div class="sharing-window__content scroll">

      <div
        class="sharing-window__sources"
        :count="sources.length"
      >

        <div
          v-for="source in sources"
          :key="source.id"
          class="sharing-window__source"
          :class="activeSourceClass(source.id)"
          @click="handleSource(source)"
        >

          <div class="sharing-window__source__image">
            <div class="sharing-window__source__image__wrapper">
              <img
                :src="source.thumbnail.toDataURL()"
              >
            </div>
          </div>

          <p class="sharing-window__source__name">
            <span>
              {{ source.name }}
            </span>
          </p>

        </div>

      </div>

    </div>

    <div class="sharing-window__footer">
      <ui-button
        v-if="!isSharingEnabled"
        class="l-mr-8"
        :type="1"
        :disabled="nothingSelected"
        @click="startSharingHandler"
      >
        Start sharing
      </ui-button>

      <ui-button
        v-if="isSharingEnabled"
        class="l-mr-8"
        :type="12"
        @click="stopSharingHandler"
      >
        Stop sharing
      </ui-button>

      <ui-button
        :type="8"
        @click="closeHandler"
      >
        Cancel
      </ui-button>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import mediaCapturer from '@classes/mediaCapturer';
import broadcastActions from '@classes/broadcastActions';

const THUMBNAIL_SIZE = 460;

export default {
  components: {
    UiButton,
  },

  data() {
    return {
      sources: [],
      selectedSource: null,
    };
  },

  computed: {
    isSharingEnabled() {
      return this.mediaState.screen === true;
    },

    nothingSelected() {
      return this.selectedSource === null;
    },

    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },
  },

  async mounted() {
    this.updateSources('screen');
  },

  methods: {
    async updateSources(type) {
      this.sources = await mediaCapturer.getSources(type, THUMBNAIL_SIZE);
      this.selectedSource = null;
    },

    activeSourceClass(id) {
      if (this.selectedSource) {
        return {
          'sharing-window__source--active': id === this.selectedSource.id,
        };
      }

      return false;
    },

    handleSource(source) {
      this.selectedSource = source;
      // if (this.$refs.video.srcObject) {
      //   mediaCapturer.destroyStream(this.$refs.video.srcObject);
      // }
      // this.$refs.video.srcObject = await mediaCapturer.getStream(source.id);
      // this.$refs.video.onloadedmetadata = (e) => this.$refs.video.play();
    },

    closeHandler() {
      broadcastActions.dispatch('closeSharingWindow');
    },

    startSharingHandler() {
      broadcastActions.dispatch('janus/setSharingSourceId', this.selectedSource.id);
      this.setScreenState(true);
      this.closeHandler();
    },

    stopSharingHandler() {
      broadcastActions.dispatch('janus/setSharingSourceId', null);
      this.setScreenState(false);
      this.closeHandler();
    },

    setScreenState(state) {
      const newState = {
        ...this.mediaState,
        ...{ screen: state },
      };

      broadcastActions.dispatch('me/setMediaState', newState);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .sharing-window
    display flex
    flex-direction column
    height 100vh
    box-sizing border-box

    &__close
      margin-left auto

    &__header
      flex 0 0 auto
      padding 20px

      &__title
        display flex
        align-items center

    &__footer
      flex 0 0 auto
      padding 20px

    &__content
      flex 1 1 auto
      display flex

    &__sources
      display flex
      flex-wrap wrap
      align-items center
      justify-content space-between
      padding 0 20px
      flex-grow 1

      &[count="1"]
        & ^[-2]__source
          width 100%

    &__source
      width calc(50% - 6px)
      margin 12px 0
      cursor pointer

      &__image
        position relative
        padding-bottom 62%

        &__wrapper
          position absolute
          left 0
          right 0
          width 100%
          height 100%
          display flex
          flex-direction column
          align-items center
          justify-content center

          img
            border-radius 4px
            max-width 100%
            max-height 100%

      &__name
        font-size 12px
        line-height 20px
        text-align center
        margin-top 12px
        padding 0 24px

        span
          display inline-block
          border-radius 20px
          padding 0 12px
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
          max-width 100%
          box-sizing border-box

      &--active
        img
          box-shadow 0 0 0 3px var(--color-1)

        span
          background var(--color-1)

      &:hover:not(.sharing-window__source--active)
        img
          box-shadow 0 0 0 3px var(--color-4)

        span
          background var(--button-bg-7)

</style>
