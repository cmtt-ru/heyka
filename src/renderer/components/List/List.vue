<template>
    <div class="list-view">
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
    filterBy: {
      type: [ String ],
      default: '',
    },
  },

  computed: {

  },

  methods: {
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
    padding 4px //! потом убрать, паддинг будем снаружи выставлять руками
</style>
