<template>
  <!-- Simple button  -->
  <div class="ui-button"
       v-if="!withIcon"
       :class="classList"
       :style="buttonSize"
       @click="$emit('click')"
  >
    <slot></slot>
  </div>

  <!-- Button with icon  -->
  <div class="ui-button"
       v-else-if="withIcon"
       :class="classList"
       :style="buttonSize"
  >

    <conditional-wrapper :wrap="needToWrapIcon">
      <div class="ui-button__icon-bg">
        <svg-icon
          class="ui-button__icon"
          :name="icon"
          :width="iconSizeComp"
          :height="iconSizeComp"
        ></svg-icon>
      </div>
    </conditional-wrapper>

    <span class="ui-button__caption">
      <slot></slot>
    </span>

    <slot name="right"></slot>
  </div>

</template>

<script>

import ConditionalWrapper from '@components/ConditionalWrapper';

/**
 * Size of icons
 * @type {{small: number, large: number, medium: number}}
 */
const ICON_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

export default {
  components: {
    ConditionalWrapper,
  },
  props: {
    /**
     * Style type of the button
     * @param [1 — 10]
     */
    type: {
      type: Number,
      required: true,
    },

    /**
     * Size of the button
     * @param small | medium | large
     */
    size: {
      type: String,
      default: 'medium',
    },

    /**
     * Exact size of the button, use with caution
     */
    height: {
      type: [Number, String],
      default: null,
    },

    /**
     * Active state of the button
     */
    active: {
      type: Boolean,
      default: false,
    },

    /**
     * Disabled state of the button
     */
    disabled: {
      type: Boolean,
      default: false,
    },

    /**
     * Loading state of the button
     */
    loading: {
      type: Boolean,
      default: false,
    },

    /**
     * Make button to fill full width
     */
    wide: {
      type: Boolean,
      default: false,
    },

    /**
     * Icon name
     */
    icon: {
      type: String,
      default: null,
    },

    /**
     * Icon size
     */
    iconSize: {
      type: Number,
      default: null,
    },

  },

  computed: {
    /**
     * Check if button caption exists. Means slot exists.
     * @returns {boolean}
     */
    withCaption() {
      return this.$slots.default !== undefined;
    },

    /**
     * Check if button has icon
     * @returns {boolean}
     */
    withIcon() {
      return this.icon !== null;
    },

    /**
     * Returns all necessary class for buttons
     *
     * @returns {object}
     */
    classList() {
      const baseClass = 'ui-button';
      const classes = {};

      /**
       * Type class
       * @type {boolean}
       */
      classes[`${baseClass}--${this.type}`] = true;

      /**
       * Size class
       * @type {boolean}
       */
      classes[`${baseClass}--${this.size}`] = true;

      /**
       * Active class
       * @type {boolean}
       */
      classes[`${baseClass}--active`] = this.active;

      /**
       * Disabled class
       * @type {boolean}
       */
      classes[`${baseClass}--disabled`] = this.disabled;

      /**
       * Loading class
       * @type {boolean}
       */
      classes[`${baseClass}--loading`] = this.loading;

      /**
       * Wide class
       * @type {boolean}
       */
      classes[`${baseClass}--wide`] = this.wide;

      /**
       * Icon class
       * @type {boolean}
       */
      classes[`${baseClass}--icon`] = this.icon !== null;

      /**
       * Caption class
       * @type {boolean}
       */
      classes[`${baseClass}--caption`] = !!this.$slots.default;

      return classes;
    },

    /**
     * Compute right icon size
     *
     * @returns {number|*}
     */
    iconSizeComp() {
      if (this.iconSize) {
        return this.iconSize;
      } else if (this.icon && !this.$slots.default) {
        return ICON_SIZES[this.size];
      }

      return ICON_SIZES['small'];
    },

    /**
     * Return true if necessary to wrap icon with div
     *
     * @returns {boolean}
     */
    needToWrapIcon() {
      // eslint-disable-next-line no-magic-numbers
      return this.type === 9;
    },

    /**
     * Return altered size of icon if "height" prop is provided
     *
     * @returns {object} style with width and height of button
     */
    buttonSize() {
      if (this.height) {
        return {
          height: this.height + 'px',
          width: this.height + 'px',
        };
      }

      return {};
    },
  },
};
</script>

<style lang="stylus">
  @import './styles/ui-button'
</style>
