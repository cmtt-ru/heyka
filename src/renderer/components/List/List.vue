<template>
  <div class="list-view">
    <slot />
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
    /**
     * Determive if list's items can be selected
     */
    selectable: {
      type: Boolean,
      default: false,
    },
  },

  mounted() {
    this.$on('selected', this.selectedChildren);
  },

  methods: {
    /**
     * Gather all list-items that have prop "selected"
     * @returns {array} keys of selected items
     */
    selectedChildren() {
      const selectedArray = this.$children.filter(el => el.selected).map(el => el.filterKey); // TODO: mb some kind of "multiPickData, not filterKey"

      this.$emit('multipick', selectedArray);
    },
  },

};
</script>

<style lang="stylus" scoped>
  .list-view
    width 100%
</style>
