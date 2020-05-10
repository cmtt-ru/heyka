<template>
  <div class="call-buttons" :size="size">
    <ui-button
      class="call-buttons__button"
      v-if="buttons.includes('screen')"
      :type="7"
      :size="size"
      icon="cast"
      @click="sharingHandler"
    />

    <ui-button
      class="call-buttons__button"
      v-if="buttons.includes('speakers')"
      :type="7"
      :size="size"
      :icon="buttonIcons.speakers"
      @click.native="switchProp('speakers')"
    />

    <ui-button
      class="call-buttons__button"
      v-if="buttons.includes('microphone')"
      :type="7"
      :size="size"
      :icon="buttonIcons.microphone"
      @click="switchProp('microphone')"
    />

    <ui-button
      class="call-buttons__button"
      v-if="buttons.includes('grid')"
      :type="7"
      :size="size"
      icon="grid"
      @click="gridHandler()"
    />

    <ui-button
      class="call-buttons__button call-buttons__button--disconnect"
      v-if="buttons.includes('leave')"
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
};

export default {
  components: {
    UiButton,
  },

  props: {
    /**
     * Buttons list
     * @example ['screen', 'speakers', 'microphone', 'grid', 'leave']
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
        microphone: ICON_MAP.microphone[this.mediaState.microphone],
        speakers: ICON_MAP.speakers[this.mediaState.speakers],
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
