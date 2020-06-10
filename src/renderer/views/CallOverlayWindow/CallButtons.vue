<template>
  <div
    class="call-buttons"
    :size="size"
  >
    <microphone
      v-if="buttons.includes('microphone')"
      class="call-buttons__button ui-button"
      :disabled="!isDeviceAvailable('microphone') || janusInProgress"
      :active="mediaState.microphone"
      :size="size"
      :icon-color="true"
      fill-color="var(--text-0)"
      @click.native="switchProp('microphone')"
    />

    <ui-button
      v-if="buttons.includes('camera')"
      :disabled="!isDeviceAvailable('camera') || janusInProgress"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonIcons.camera.icon"
      :stroke="buttonIcons.camera.stroke"
      @click="cameraHandler();switchProp('camera')"
    />

    <ui-button
      v-if="buttons.includes('screen')"
      :disabled="janusInProgress"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonIcons.screen.icon"
      :stroke="buttonIcons.screen.stroke"
      @click="sharingHandler"
    />

    <ui-button
      v-if="buttons.includes('speakers')"
      class="call-buttons__button"
      :type="7"
      :size="size"
      :icon="buttonIcons.speakers.icon"
      :stroke="buttonIcons.speakers.stroke"
      @click.native="switchProp('speakers')"
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
      :disabled="janusInProgress"
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
import broadcastEvents from '@classes/broadcastEvents';
import Microphone from '@components/Microphone';

/**
 * Map media state points to corresponding icons
 */
const ICON_MAP = {
  speakers: {
    true: {
      icon: 'headphones',
      stroke: 'var(--text-0)',
    },
    false: {
      icon: 'headphones-off',
      stroke: 'var(--text-1)',
    },
  },
  camera: {
    true: {
      icon: 'video',
      stroke: 'var(--text-0)',
    },
    false: {
      icon: 'video-off',
      stroke: 'var(--text-1)',
    },
  },
  screen: {
    true: {
      icon: 'screencast',
      stroke: 'var(--text-0)',
    },
    false: {
      icon: 'screencast-off',
      stroke: 'var(--text-1)',
    },
  },
};

export default {
  components: {
    UiButton,
    Microphone,
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
    buttonIcons() {
      return {
        speakers: ICON_MAP.speakers[this.mediaState.speakers],
        camera: ICON_MAP.camera[this.mediaState.camera],
        screen: ICON_MAP.screen[this.mediaState.screen],
      };
    },

    janusInProgress() {
      return this.$store.getters['janus/inProgress'];
    },

    /**
     * Selected devices
     * @returns {object}
     */
    selectedDevices() {
      return this.$store.getters['app/getSelectedDevices'];
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
     * Open Grid if camera is turned on
     * @returns {void}
     */
    cameraHandler() {
      if (!this.mediaState.camera) {
        this.gridHandler();
      }
    },

    /**
     * Grid button handler
     * @returns {void}
     */
    gridHandler() {
      broadcastActions.dispatch('openGrid');
      broadcastEvents.dispatch('grid');
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
      if (this.mediaState.screen === true) {
        broadcastActions.dispatch('janus/setSharingSource', null);
        this.switchProp('screen');
      } else {
        broadcastActions.dispatch('openSharingWindow');
      }
    },

    /**
     * Return availability of specific device
     * @param {string} deviceType – device type
     * @returns {boolean}
     */
    isDeviceAvailable(deviceType) {
      return !!this.selectedDevices[deviceType];
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
