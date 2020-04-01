<template>
    <div
      class="list-item"
      v-if="ifPassesFilter"
      :class="{'list-item--button': button, 'list-item--selected' : selected}"
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
    text: {
      type: [ String ],
      default: '',
    },
    filterKey: {
      type: [ String ],
      default: '',
    },
    button: {
      type: [ Boolean ],
      default: false,
    },
    selected: {
      type: [ Boolean ],
      default: false,
    },
    active: {
      type: [ Boolean ],
      default: false,
    },
  },
  computed: {
    ifPassesFilter() {
      if (this.filterKey.toLowerCase().includes(this.parentFilterBy.toLowerCase())) {
        return true;
      } // TODO: сделать умный поиск (например, с перепутанной раскладкой)

      return false;
    },
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

.list-item--selected
  background-color var(--item-bg-multi-pick) //? надо ли отдать эту логику стилей на контент лист айтема?
.list-item--button
  cursor pointer

$color1 = var(--item-bg-multi-pick)
$color2 = var(--item-bg-hover)
.list-item--selected.list-item--button:hover
  background-blend-mode: mulitply;
  background-image: linear-gradient(0deg, $color1, $color2);

</style>
