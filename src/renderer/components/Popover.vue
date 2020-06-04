<template>
  <div
    class="popover"
    :style="$themes.getColors('content')"
  >
    <slot />
  </div>
</template>

<script>
export default {

};
</script>

<style lang="stylus" scoped>
  .popover
    display flex
    background var(--app-bg)
    border 1px solid var(--shadow-20)
    box-shadow 0 3px 8px var(--shadow-15), 0 0 8px var(--shadow-15)
    border-radius 4px
    z-index 100
    flex-direction column
    min-width 130px
    box-sizing border-box

    /deep/ a
      .ui-button
        width 100%

    /deep/ .delimiter
      height 1px
      width 100%
      background var(--button-bg-4)
      margin 4px 0

    /deep/ .buttons
      padding 4px
      display flex
      flex-direction column
</style>
