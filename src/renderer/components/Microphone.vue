<template>
  <div class="mic">

      <div
        v-if="active"
        class="mic__volume"
        :style="volume"
      ></div>

      <svg-icon
          class="mic__icon"
          :name="icon"
          width="16"
          height="16"
        ></svg-icon>

  </div>
</template>

<script>

/**
 * Mic icons
 */
const STATES = {
  true: 'mic',
  false: 'mic-off',
};

export default {
  props: {
    /**
     * State of microphone (active ar disabled)
     */
    active: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * Display either active or inactive icon
     * @returns {object}
     */
    icon() {
      return STATES[this.active];
    },

    /**
     * Convert DB to height in percentage, filling up the mic icon
     * @returns {object}
     */
    volume() {
      return {
        // eslint-disable-next-line no-magic-numbers
        height: Math.floor(this.$store.state.app.microphoneVolume + 100) * 0.37 + '%',
      };
    },
  },
};
</script>

<style lang="stylus" scoped>
.mic
    position relative
    width 24px
    height 24px
    background-color var(--button-bg-5)
    border-radius 4px
    cursor pointer
    display flex
    flex-direction row
    align-items center
    justify-content center
    flex-shrink 0

    &:hover
        background var(--button-bg-6)

    &:active
        transform translateY(1px)

    &__volume
        background-color var(--color-1)
        width 15%
        position absolute
        bottom 44%
        left 43%

    &__icon
        position relative

</style>