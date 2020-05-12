<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        @click="fullscreenClickHandler"
      >
        {{ texts.fullscreen }}
      </ui-button>
      <ui-button
        :type="11"
        @click="muteClickHandler"
      >
        {{ texts.mute }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {
    /**
     * User ID
     */
    userId: {
      type: String,
      default: null,
    },
  },

  methods: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      console.log(this.$t);

      return this.$t('popover.gridUser');
    },
    /**
     * fullscreen click handler
     * @returns {void}
     */
    fullscreenClickHandler() {
      console.log('fullscreen user', this.userId);
    },

    /**
     * Mute click handler
     * @returns {void}
     */
    muteClickHandler() {
      console.log('mute user', this.userId);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
