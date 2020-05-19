<template>
  <div class="tooltip">
    <div
      class="tooltip__arrow"
      data-popper-arrow
    />
    <span>
      {{ label }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="stylus">
  .tooltip
    pointer-events none
    position relative
    background var(--color-5)
    color var(--text-tech-3)
    font-size 12px
    line-height 24px
    padding 0 8px
    border-radius 6px
    box-sizing border-box
    transition opacity .5s

    &__arrow
      position absolute
      width 0
      height 0
      border-style solid

    &[data-popper-placement="bottom"]
      & ^[0]__arrow
        top -5px
        border-width 0 5px 5px 5px
        border-color transparent transparent var(--color-5) transparent

    &[data-popper-placement="top"]
      & ^[0]__arrow
        bottom -5px
        border-width 5px 5px 0 5px
        border-color var(--color-5) transparent transparent transparent

    span
      opacity 0.9
</style>
