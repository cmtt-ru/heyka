<template>
  <div
    class="switch"
    :class="{'switch--disabled': disabled}"
    @click="ClickHandler()"
  >
    <div
      v-textfade="text"
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

  data() {
    return {
      state: this.value,
    };
  },

  methods: {
    /**
     * Detect switch click. We change state to opposite and emit 'input' event
     * @returns {void}
     */
    ClickHandler() {
      this.state = !this.state;
      this.$emit('input', this.state);
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
    background-color var(--icon-2)
    border 0.5px solid var(--line-stroke)
    border-radius 10px
    z-index 1
    -webkit-transition background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1)
    transition background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1)
    flex-shrink 0

    &:after
      content ''
      box-sizing border-box
      position absolute
      top -1.5px
      right 11.5px
      width 12px
      height 12px
      background-color #fff //?: move this color to themes.json?
      border-radius 12px
      border 0.5px solid var(--line-stroke)
      box-shadow 0px 1px 2px rgba(0, 0, 0, 0.15)
      z-index 2
      -webkit-transition all 0.28s cubic-bezier(0.4, 0, 0.2, 1)
      transition all 0.28s cubic-bezier(0.4, 0, 0.2, 1)
      -webkit-transition-property right, background-color
      transition-property right, background-color

    &--checked
      background-color var(--color-2)

      &:after
        right -0.5px

  &__text
    margin-right 8px

</style>
