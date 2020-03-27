<template>
  <!-- Simple button  -->
  <div class="ui-button"
       v-if="!withIcon"
       :class="classList"
  >
    <slot></slot>
  </div>

  <!-- Button with icon  -->
  <div class="ui-button"
       v-else-if="withIcon"
       :class="classList"
  >
    <svg-icon :name="icon" size="16"></svg-icon>
    <slot></slot>
  </div>

</template>

<script>
export default {
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
     * Size of the button.
     * @param small | medium | large
     */
    size: {
      type: String,
      default: 'medium',
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

  },

  computed: {
    /**
     * Check if button caption exists. Means slot exists.
     * @return {boolean}
     */
    withCaption() {
      return this.$slots.default !== undefined;
    },

    /**
     * Check if button has icon
     * @return {boolean}
     */
    withIcon() {
      return this.icon !== null;
    },

    /**
     * Returns all necessary class for buttons
     *
     * @return {Object}
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

      return classes;
    },
  },

  methods: {

  },

  mounted() {

  },
};
</script>

<style lang="stylus">
  @import './styles/ui-button'
</style>
