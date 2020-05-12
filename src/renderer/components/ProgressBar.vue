<template>
  <div class="progress-bar">
    <div
      class="progress-bar__value"
      :style="{width: value + '%'}"
    />
  </div>
</template>

<script>

export default {
  props: {
    /**
     * Value in percent
     * min – 0
     * max – 100
     */
    value: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="stylus" scoped>
  .progress-bar
    background var(--input)
    height 4px
    border-radius 6px
    overflow hidden
    box-shadow inset 0 0 0 1px var(--stroke-3)

    &__value
      background var(--color-1)
      height 100%
</style>
