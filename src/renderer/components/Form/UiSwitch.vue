<template>
<div
 class="switch"
:class="{'switch--disabled': disabled, 'switch--checked': value}"
@click="ClickHandler()"
>
  <div v-textfade="text" class="switch__text">{{text}}</div>
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
  display inline-block
  position relative
  width 100%
  height 34px
  box-sizing border-box
  border-radius 4px
  padding 8px
  overflow hidden
  cursor pointer

  &:hover
    background-color var(--item-bg-hover)

  &--disabled
    opacity 0.5
    pointer-events none

  &:before
    content ''
    box-sizing border-box
    position absolute
    top 12px
    right 8px
    width 24px
    height 10px
    background-color var(--icon-2)
    border 0.5px solid var(--line-stroke)
    border-radius 10px
    z-index 1
    -webkit-transition background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1)
    transition background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1)

  &:after
    content ''
    box-sizing border-box
    position absolute
    top 11px
    right 20px
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

  &--checked:before
    background-color var(--color-2)

  &--checked:after
    right 8px

  &__text
    margin-right 32px

</style>
