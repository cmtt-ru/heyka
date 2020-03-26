<template>
  <div class="ui-button" :class="classes"></div>
</template>

<script>
export default {
  name: 'svg-icon',
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

  },

  methods: {

  },

  mounted() {

  },
};
</script>

<style lang="stylus">

</style>
