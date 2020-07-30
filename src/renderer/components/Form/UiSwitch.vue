<template>
  <div
    class="switch"
    :class="{'switch--disabled': disabled}"
    @click="ClickHandler()"
  >
    <div
      v-textfade
      class="switch__text"
    >
      {{ text }}
    </div>
    <div
      class="switch__toggle"
      :class="{'switch__toggle--checked': value}"
    />
  </div>
</template>

<script>

export default {

  props: {
    /**
     * Text before switch
     */
    text: {
      type: String,
      default: null,
    },

    /**
     * switch's initial state
     */
    value: {
      type: Boolean,
      default: false,
    },

    /**
     * Make whole switch inactive
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * Local copy of toggle's state
     * @returns {string} value
     */
    localValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  methods: {
    /**
     * Detect switch click. We change state to opposite and emit 'input' event
     * @returns {void}
     */
    ClickHandler() {
      this.localValue = !this.localValue;
    },
  },

};
</script>

<style lang="stylus" scoped>
.switch
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  width 100%
  height 18px
  border-radius 4px
  cursor pointer

  &--disabled
    opacity 0.5
    pointer-events none

  &__toggle
    box-sizing border-box
    position relative
    width 24px
    height 10px
    background-color var(--input)
    border-radius 10px
    z-index 1
    flex-shrink 0
    box-shadow inset 0 0 0 0.5px var(--line-stroke)
    transition all 0.28s cubic-bezier(0.4, 0, 0.2, 1)
    transition-property background-color, box-shadow

    &:after
      content ''
      box-sizing border-box
      position absolute
      top -1px
      right 12px
      width 12px
      height 12px
      background-color var(--app-bg)
      border-radius 12px
      box-shadow 0 0 0 0.5px var(--line-stroke), 0 1px 2px rgba(0, 0, 0, 0.15)
      z-index 2
      transition all 0.28s cubic-bezier(0.4, 0, 0.2, 1)
      transition-property right, background-color

    &--checked
      background-color var(--color-2)
      box-shadow inset 0 0 0 0.5px #1264CD

      &:after
        right 0

  &__text
    margin-right 8px

</style>
