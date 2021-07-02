<template>
  <div class="sharing-window">
    <div class="sharing-window__header">
      <div class="sharing-window__header__title">
        <span class="sharing-window__title">{{ texts.title }}</span>
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
          class="l-mr-4 window__options__button"
          :type="13"
          :active="sourceButton === 'screen'"
          size="small"
          @click="updateSources('screen')"
        >
          {{ texts.screen }}
        </ui-button>

        <ui-button
          class="l-mr-4 window__options__button"
          :type="13"
          :active="sourceButton === 'window'"
          size="small"
          @click="updateSources('window')"
        >
          {{ texts.window }}
        </ui-button>

        <ui-switch
          v-if="sourceButton === 'screen'"
          v-model="allowDraw"
          class="drawing-switch"
          :text="texts.drawing"
        />
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
          :class="{'sharing-window__source--active': isActiveSource(source.id)}"
          @click="handleSource(source)"
        >
          <div class="sharing-window__source__image">
            <div class="sharing-window__source__image__wrapper">
              <img
                :src="source.thumbnail.toDataURL()"
              >
            </div>

            <p class="sharing-window__source__name">
              <span>
                {{ source.name }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="sharing-window__footer">
      <ui-button
        v-if="!isSharingEnabled"
        class="l-mr-8"
        size="large"
        :type="1"
        :disabled="nothingSelected"
        @click="startSharingHandler"
      >
        {{ texts.start }}
      </ui-button>

      <ui-button
        v-if="isSharingEnabled"
        class="l-mr-8"
        size="large"
        :type="12"
        @click="stopSharingHandler"
      >
        {{ texts.stop }}
      </ui-button>

      <ui-button
        :type="8"
        size="large"
        @click="closeHandler"
      >
        {{ texts.cancel }}
      </ui-button>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiSwitch } from '@components/Form';
import mediaCapturer from '@classes/mediaCapturer';
import broadcastActions from '@sdk/classes/broadcastActions';
import { mapGetters } from 'vuex';

/**
 * Size of the source thumbnails
 * @type {number}
 */
const THUMBNAIL_SIZE = 460;

export default {
  components: {
    UiButton,
    UiSwitch,
  },

  data() {
    return {
      sources: [],
      selectedSource: null,
      sourceButton: 'screen',
    };
  },

  computed: {
    ...mapGetters({
      mediaState: 'me/getMediaState',
    }),

    allowDraw: {
      get() {
        return this.$store.state.me.allowDraw;
      },
      set(val) {
        this.$store.commit('me/SET_ALLOW_DRAW', val);
      },

    },

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('call.sharing');
    },

    /**
     * Is sharing enabled
     * @returns {boolean}
     */
    isSharingEnabled() {
      return this.mediaState.screen === true;
    },

    /**
     * Active source id
     * @returns {string}
     */
    activeSourceId() {
      const source = this.$store.state.janus.sharingSource;

      return source && source.id;
    },

    /**
     * Determines that nothing source is selected
     * @returns {boolean}
     */
    nothingSelected() {
      return this.selectedSource === null;
    },

  },

  mounted() {
    this.updateSources('screen');
  },

  methods: {
    /**
     * Update list of available sources for stream
     *
     * @param {string} type – source type. Can be `screen` or `window`.
     * @returns {Promise<void>}
     */
    async updateSources(type) {
      this.sourceButton = type;
      this.sources = await mediaCapturer.getSources(type, THUMBNAIL_SIZE);
      this.selectedSource = null;

      /** Filter windows with name `heyka` */
      this.sources = this.sources.filter(s => s.name !== 'heyka');

      /** Select first source */
      this.handleSource(this.sources[0]);
    },

    /**
     * Return's active source class by source id
     *
     * @param {string} id – source id
     * @returns {boolean|object}}
     */
    isActiveSource(id) {
      let state = false;

      if (this.activeSourceId) {
        state = this.activeSourceId === id;
      }

      if (this.selectedSource) {
        return this.selectedSource.id === id;
      }

      return state;
    },

    /**
     * Handle source
     *
     * @param {object} source – source object
     * @returns {void}
     */
    handleSource(source) {
      this.selectedSource = source;
      this.selectedSource.index = this.sources.findIndex(s => s.id === source.id);
    },

    /**
     * Close handler
     *
     * @returns {void}
     */
    closeHandler() {
      broadcastActions.dispatch('closeSharingWindow');
    },

    /**
     * Start sharing
     *
     * @returns {void}
     */
    startSharingHandler() {
      this.closeHandler();
      broadcastActions.dispatch('janus/setSharingSource', this.selectedSource);
      this.setScreenState(true);
    },

    /**
     * Stop sharing
     *
     * @returns {void}
     */
    stopSharingHandler() {
      this.closeHandler();
      broadcastActions.dispatch('janus/setSharingSource', null);
      this.setScreenState(false);
    },

    /**
     * Set's screen media state
     *
     * @param {boolean} state – screen state
     * @returns {void}
     */
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
    color var(--Text-white)

    &__close
      margin-left auto

    &__header
      flex 0 0 auto
      padding 20px 20px 12px 20px

      &__title
        display flex
        align-items center
        font-size 14px
        line-height 28px

    &__footer
      flex 0 0 auto
      padding 20px
      box-shadow 0 0 0 1px var(--UI-divider-1)

    &__content
      flex 1 1 auto
      display flex
      -webkit-app-region no-drag

    &__options
      margin-top 16px
      display flex

      &__button
        height 14px !important

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
          max-height 264px

    &__source
      width calc(50% - 6px)
      margin 12px 0
      cursor pointer
      background var(--Background-darkgrey)
      border-radius 2px

      &__image
        position relative
        padding-bottom 61.6%

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
          box-sizing border-box
          padding 8px
          max-height 264px

          img
            border-radius 4px
            max-width 100%
            max-height 100%

      &__name
        position absolute
        font-size 12px
        line-height 20px
        text-align center
        padding 0 24px
        bottom 6px
        width 100%
        box-sizing border-box

        span
          display inline-block
          border-radius 4px
          padding 0 12px
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
          max-width 100%
          box-sizing border-box
          background #000

      &--active
          box-shadow inset 0 0 0 2px var(--UI-positive)

      &:hover:not(.sharing-window__source--active)
        opacity 0.7

.drawing-switch
  width fit-content
  -webkit-app-region no-drag
  display inline-flex
  font-size 12px
  margin-left auto
  height 28px
</style>
