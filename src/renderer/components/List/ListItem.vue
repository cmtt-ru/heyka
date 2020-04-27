<template>
    <div
      class="list-item"
      :class="{'list-item--selected': selected}"
      v-if="matchesFilter"
      @click="clickHandler()"
    >
    <slot></slot>
    </div>
</template>

<script>
export default {
  data: function () {
    return {
      /**
     * Whether item is selected (for multi pick, eg. when sending invites to multiple people)
     */
      selected: false,
      parent: this.$parent,
    };
  },

  props: {
    /**
     * Key for list searching/filtering. In most cases it is just text on the list-item
     */
    filterKey: {
      type: String,
      default: '',
    },
    /**
     * whether we should add button behaviour (cursor: pointer)
     */
    button: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /**
     * Decide if item matches List's filter
     * @returns {Boolean}
     */
    matchesFilter() {
      if (this.filterKey.toLowerCase().includes(this.parentFilterBy.toLowerCase())) {
        return true;
      } // TODO: сделать умный поиск (например, с перепутанной раскладкой)

      return false;
    },
    /**
     * Get Parent's filter
     * @returns {string}
     */
    parentFilterBy() {
      return this.parent.filterBy || '';
    },
  },

  methods: {
    /**
     * Change 'selected' state
     * @returns {string}
     */
    clickHandler() {
      if (!this.parent.selectable) {
        return;
      }
      this.selected = !this.selected;
      this.parent.$emit('selected');
    },
  },

};
</script>

<style lang="stylus" scoped>
.list-item
  display flex
  flex-direction row
  justify-content flex-start
  align-items center
  border-radius 4px
  box-sizing border-box

  &--selected
    background-color var(--item-bg-multi-pick)
</style>
