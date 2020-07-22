<template>
  <div class="pseudo-popup">
    sdf
    <slot name="title" />

    <slot name="body" />

    <slot name="footer" />

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

</style>
