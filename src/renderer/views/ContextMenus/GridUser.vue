<template>
  <popover>
    <div class="buttons">
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

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.griduser');
    },
  },

  methods: {

    /**
     * Mute click handler
     * @returns {void}
     */
    muteClickHandler() {
      console.log('mute user', this.userId);
      this._notImplemented();
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
