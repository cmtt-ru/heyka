<template>
  <div class="ui-button">
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
      default: 1,
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
    withCaption() {
      return this.$slots.default !== undefined;
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
