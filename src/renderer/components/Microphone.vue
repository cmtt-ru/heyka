<template>
  <div
    class="mic"
    :style="buttonSizeComp"
  >
    <div
      class="volume-wrapper"
      :style="iconWrapperSizeComp"
    >
      <div
        v-if="active"
        class="mic__volume"
        :style="volume"
      />
      <svg-icon
        class="mic__icon"
        :name="iconProp.icon"
        :stroke="iconColor && iconProp.stroke"
        :width="iconSizeComp"
        :height="iconSizeComp"
      />
    </div>
  </div>
</template>

<script>

/**
 * Mic icons
 */
const STATES = {
  true: {
    icon: 'mic',
    stroke: 'var(--text-0)',
  },
  false: {
    icon: 'mic-off',
    stroke: 'var(--text-1)',
  },
};

/**
 * Size of icons
 * @type {{small: number, large: number, medium: number}}
 */
const ICON_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

/**
 * Size of icons
 * @type {{small: number, large: number, medium: number}}
 */
const BUTTON_SIZES = {
  small: {
    width: '24px',
    height: '24px',
    'border-radius': '4px',
  },
  medium: {
    width: '36px',
    height: '36px',
    'border-radius': '4px',
  },
  large: {
    width: '64px',
    height: '64px',
    'border-radius': '8px',
  },
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

    /**
     * Size of the button
     * @param small | medium | large
     */
    size: {
      type: String,
      default: 'small',
    },

    /**
     * Enable's icon color depends on state
     */
    iconColor: {
      type: Boolean,
      default: undefined,
    },

    /**
     * Enable's volume fill color
     */
    fillColor: {
      type: String,
      default: undefined,
    },
  },

  computed: {
    /**
     * Display either active or inactive icon
     * @returns {object}
     */
    iconProp() {
      return STATES[this.active];
    },

    /**
     * Convert DB to height in percentage, filling up the mic icon
     * @returns {object}
     */
    volume() {
      return {
        // eslint-disable-next-line no-magic-numbers
        transform: `scaleY(${Math.floor(this.$store.getters['app/getMicrophoneVolume'] + 100) / 100})`,
        backgroundColor: this.fillColor,
      };
    },
    /**
     * Compute right icon size
     *
     * @returns {number|*}
     */
    iconSizeComp() {
      return ICON_SIZES[this.size];
    },

    /**
     * Compute right icon size
     *
     * @returns {number|*}
     */
    iconWrapperSizeComp() {
      return {
        width: ICON_SIZES[this.size] + 'px',
        height: ICON_SIZES[this.size] + 'px',
      };
    },

    /**
     * Compute right button size
     *
     * @returns {number|*}
     */
    buttonSizeComp() {
      return BUTTON_SIZES[this.size];
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
        width 24%
        position absolute
        bottom 42%
        left 38%
        height 46%
        transform-origin bottom left

    &__icon
        position relative

.volume-wrapper
  position absolute

</style>
