<template>
  <div class="popover">
    <slot/>
  </div>
</template>

<script>
export default {

};
</script>

<style lang="stylus" scoped>
  .popover
    display flex
    background #fff
    padding 4px
    border 0.5px solid rgba(0, 0, 0, 0.2)
    box-shadow 0 3px 8px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 0, 0, 0.15)
    border-radius 4px
    z-index 100
    flex-direction column
    min-width 130px
    box-sizing border-box

    /deep/ a
      .ui-button
        width 100%
</style>
