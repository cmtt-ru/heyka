<template>
    <div class="list-item" :class="{'list-item--button': button}">
      <div v-if="$slots.leftIcon" class="item__icon-left">
        <slot name="leftIcon"></slot>
      </div>
      <div class="item__text">
        <slot></slot>
      </div>
      <div v-if="$slots.rightIcons" :class="{'item__icon-right--float': floatIcons}" class="item__icon-right">
        <slot name="rightIcons"></slot>
      </div>
    </div>
</template>

<script>
export default {
  data: function () {
    return {

    };
  },

  props: {
    floatIcons: {
      type: [ Boolean ],
      default: false,
    },
    button: {
      type: [ Boolean ],
      default: false,
    },
  },

};
</script>

<style lang="stylus">
.list-item
  display flex
  flex-direction row
  justify-content: flex-start
  align-items center
  margin 4px
  padding 4px
  border-radius 4px

.list-item--button:hover
  background-color var(--item-bg-hover)

.item__text
  padding 0 6px

.item__icon-right--float
  margin-left: auto;
</style>
