<template>
<div
  v-click-outside="hide"
  class="dropdown"
  :class="{'dropdown--disabled': disabled}"
>
  <div @click="headerClickHandler()" class="dropdown__header">
    <div v-textfade="selectedText">{{selectedText}}</div>
    <svg-icon
      class="dropdown__header__icon"
      name="arrow-down"
    ></svg-icon>
  </div>

  <div class="dropdown__list" :class="{'dropdown__list--visible': visible}">
    <div
      v-for="item in data" :key="item.value"
      @click="variantClickHandler(item)"
      class="dropdown__item"
      :class="{'dropdown__item--selected': item == selectedItem}"
    >
      <div v-textfade>{{item.name}}</div>
    </div>
  </div>

</div>
</template>

<script>

export default {

  props: {
    /**
     * Array with {name, value}
     */
    data: {
      type: Array,
      required: true,
    },

    /**
     * Select's initial state (selected item)
     */
    value: {
      type: String,
      default: null,
    },

    /**
     * Initial text if no item is selected
     */
    text: {
      type: String,
    },

    /**
     * Make whole dropdown inactive
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      listNode: {},
      arrowNode: {},
      visible: false,
      myValue: this.value,
    };
  },

  computed: {
    selectedItem() {
      return this.data.find((el) => {
        if (el.value === this.myValue) {
          return el;
        }
      }) || null;
    },
    /**
     * Text to display on top selection. Can be selected item or initial text before first selection.
     * @returns {string} text to display
     */
    selectedText() {
      if (this.selectedItem) {
        return this.selectedItem.name;
      }

      return this.text;
    },

  },

  watch: {
    value(newValue, oldValue) {
      this.myValue = newValue;
    },
  },

  methods: {
    /**
     * We clicked header (open/close toggle)
     * @returns {void}
     */
    headerClickHandler() {
      this.toggle();
    },

    /**
     * We clicked one of the variants (select new item, close toggle, emit 'input' event)
     * @param {object} item item which we clicked
     * @returns {void}
     */
    variantClickHandler(item) {
      this.myValue = item.value;
      this.hide();
      this.$emit('input', item.value);
    },

    /**
     * Change select's state (open <-> close)
     * @returns {void}
     */
    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    },

    /**
     * Open select. We need to do a lot of shenanigans so that dropdown part is fully visible. If not, make it dropUP. And turn the arrow upside down.
     * @returns {void}
     */
    show() {
      this.visible = true;
      /* By default dropdown is UNDER select header, and arrow icon is pointing down */
      this.listNode.style.top = '100%';
      this.arrowNode.style.transform = 'rotate(0deg)';

      this.$nextTick(() => {
        const position = this.listNode.getBoundingClientRect();

        // Next tick after showing dropdown we check if it is fully visible.
        // If not - put it on top of select and rotate arrow by 180 deg.
        if (position.bottom > window.innerHeight || position.top <= 0) {
          this.listNode.style.top = position.height * (-1) + 'px';
          this.arrowNode.style.transform = 'rotate(180deg)';
        }
      });
    },

    /**
     * Hide select
     * @returns {void}
     */
    hide() {
      this.visible = false;
    },
  },

  mounted() {
    /* Store locally refs to sropdown and icon elements, we need them on every 'open' event */
    this.listNode = this.$el.querySelector('.dropdown__list');
    this.arrowNode = this.$el.querySelector('.dropdown__header__icon');
  },

};
</script>

<style lang="stylus" scoped>
.dropdown
  position relative

  &--disabled
    opacity 0.5
    pointer-events none

  &__header
    background-color var(--input)
    cursor pointer
    height 32px
    box-sizing border-box
    border-radius 4px
    padding 7px 12px
    border 1px solid var(--stroke-3)
    display flex
    flex-direction row
    justify-content space-between
    align-items center

    &:hover
      background-color var(--button-bg-4)

    &__icon
      color var(--icon-1)
      margin-left 8px

  &__list
    position absolute
    background-color var(--input)
    top 100%
    left 0
    right 0
    z-index 99
    border-radius 4px
    overflow hidden
    display none
    //max-height 100px
    //overflow-y auto

    &--visible
      display block

  &__item
    padding 7px 12px
    box-sizing border-box
    height 32px
    border-bottom 1px solid var(--stroke-3)
    cursor pointer

    &:hover
      background-color var(--button-bg-4)

    &--selected
      color var(--color-2)
</style>
