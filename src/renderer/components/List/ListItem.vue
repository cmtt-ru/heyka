<template>
    <div
      class="list-item"
      v-if="matchesFilter"
      :class="{'list-item--button': button}"
    >
    <slot></slot>
    </div>
</template>

<script>
export default {
  data: function () {
    return {

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
    /**
     * Whether item is selected (for multi pick, eg. when sending invites to multiple people)
     */
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /**
     * Decide if item matches List's filter
     * @return {Boolean}
     */
    matchesFilter() {
      if (this.filterKey.toLowerCase().includes(this.parentFilterBy.toLowerCase())) {
        return true;
      } // TODO: сделать умный поиск (например, с перепутанной раскладкой)

      return false;
    },
    /**
     * Get Parent's filter
     * @return {String}
     */
    parentFilterBy() {
      return this.$parent.filterBy || '';
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

  &--button
    cursor pointer
</style>
