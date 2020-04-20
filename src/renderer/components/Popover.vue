<template>
  <div class="popover">
    <slot/>
  </div>
</template>

<script>

export default {
  props: {

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
  .popover
    width 130px
    text-align center
    background #fff
    padding 10px
    border 0.5px solid rgba(0, 0, 0, 0.2)
    box-shadow 0 3px 8px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 0, 0, 0.15)
    border-radius 4px
    z-index 100
</style>
