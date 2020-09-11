<template>
  <div
    v-show="isSelected"
  >
    <slot />
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    /**
     * Name of the tab
     */
    name: {
      type: String,
      default: null,
    },

    /**
     * Selected state of the tab
     */
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSelected: false,
    };
  },

  mounted() {
    this.isSelected = this.selected;
  },
};
</script>

<style scoped lang="stylus">

</style>
