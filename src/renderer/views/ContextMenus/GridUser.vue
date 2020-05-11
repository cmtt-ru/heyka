<template>
  <popover>
    <ui-button :type="11" @click="fullscreenClickHandler">Fullscreen</ui-button>
    <ui-button :type="11" @click="muteClickHandler">Mute for all</ui-button>
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
    userId: String,
  },

  methods: {
    /**
     * Poke click handler
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
