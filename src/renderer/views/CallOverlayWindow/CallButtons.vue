<template>
  <div
    class="call-buttons"
    :size="size"
  >
    <ui-button
      v-if="buttons.includes('camera')"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonProp.camera.icon"
      :stroke="buttonProp.camera.color"
      @click="switchProp('camera')"
    />

    <ui-button
      v-if="buttons.includes('screen')"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonProp.screen.icon"
      :stroke="buttonProp.screen.color"
      @click="sharingHandler"
    />

    <ui-button
      v-if="buttons.includes('speakers')"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonProp.speakers"
      @click.native="switchProp('speakers')"
    />

    <ui-button
      v-if="buttons.includes('microphone')"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonProp.microphone"
      @click="switchProp('microphone')"
    />

    <ui-button
      v-if="buttons.includes('grid')"
      class="call-buttons__button"
      :type="7"
      :size="size"
      icon="grid"
      @click="gridHandler()"
    />

    <ui-button
      v-if="buttons.includes('leave')"
      class="call-buttons__button call-buttons__button--disconnect"
      :type="7"
      :size="size"
      icon="disconnect"
      @click="disconnectHandler"
    />
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import broadcastActions from '@classes/broadcastActions';

/**
 * Map media state points to corresponding icons
 */
const ICON_MAP = {
  microphone: {
    true: 'mic',
    false: 'mic-off',
  },
  speakers: {
    true: 'headphones',
    false: 'headphones-off',
  },
  camera: {
    true: {
      icon: 'cast',
      color: undefined,
    },
    false: {
      icon: 'cast',
      color: 'var(--color-1)',
    },
  },
  screen: {
    true: {
      icon: 'screencast',
      color: undefined,
    },
    false: {
      icon: 'screencast',
      color: 'var(--color-1)',
    },
  },
};

export default {
  components: {
    UiButton,
  },

  props: {
    /**
     * Buttons list
     * @example ['screen', 'camera', 'speakers', 'microphone', 'grid', 'leave']
     */
    buttons: {
      type: Array,
      default: function () {
        return [];
      },
    },

    /**
     * Size of the buttons
     */
    size: {
      type: String,
      default: 'medium',
    },
  },

  computed: {
    /**
     * Get our media state
     * @returns {object}
     */
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },

    /**
     * Determine which icons to show
     * @returns {object}
     */
    buttonProp() {
      return {
        microphone: ICON_MAP.microphone[this.mediaState.microphone],
        speakers: ICON_MAP.speakers[this.mediaState.speakers],
        camera: ICON_MAP.camera[this.mediaState.camera],
        screen: ICON_MAP.screen[this.mediaState.screen],
      };
    },
  },

  methods: {
    /**
     * Change our media state depending on which button was clicked
     * @param {string} property mediastate's property name
     * @returns {void}
     */
    switchProp(property) {
      const newState = { ...this.mediaState };

      newState[property] = !this.mediaState[property];

      broadcastActions.dispatch('me/setMediaState', newState);
    },

    /**
     * Grid button handler
     * @returns {void}
     */
    gridHandler() {
      broadcastActions.dispatch('openGrid');
    },

    /**
     * Disconnect button handler
     * @returns {void}
     */
    disconnectHandler() {
      broadcastActions.dispatch('unselectChannel', this.$store.getters['me/getSelectedChannelId']);
    },

    /**
     * Sharing button handler
     * @returns {void}
     */
    sharingHandler() {
      broadcastActions.dispatch('openSharingWindow');
    },

    /**
     * Camera button handler
     * @returns {void}
     */
    cameraHandler() {
      console.log('camera click');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-buttons
    display flex

    &__button
      flex-shrink 0

      &--disconnect
        color var(--color-0)

      &:last-child
        margin-right 0 !important

    &[size="medium"]
      & ^[-1]__button
        margin-right 8px

    &[size="large"]
      & ^[-1]__button
        margin-right 16px

</style>
