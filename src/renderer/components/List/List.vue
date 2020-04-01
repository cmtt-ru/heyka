<template>
    <div class="list-view">
        <slot></slot>
    </div>
</template>

<script>
export default {
  props: {
    /**
     * Show only list-items that match this string by their filterKey
     */
    filterBy: {
      type: String,
      default: '',
    },
  },

  methods: {

    /**
     * Gather all list-items that have prop "selected"
     * @return {Array} keys of selected items
     */
    selectedChildren() {
      const selectedArray = [];

      for (const child of this.$children) {
        if (child.selected) {
          selectedArray.push(child.filterKey);
        }
      }

      return selectedArray;
    },
  },

  mounted() {
    this.selectedChildren();
  },

};
</script>

<style lang="stylus" scoped>
  .list-view
    width 100%
</style>
