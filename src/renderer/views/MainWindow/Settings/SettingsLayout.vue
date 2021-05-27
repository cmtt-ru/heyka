<template>
  <div class="layout">
    <div
      class="layout__appbar"
      :class="{'layout__appbar--mac': IS_MAC}"
    >
      <div class="resizing-padding" />
      <appbar />
    </div>
    <div
      class="layout__header"
      :class="{'layout__header--mac': IS_MAC}"
    >
      <slot name="header" />
    </div>
    <div
      class="layout__content"
    >
      <div
        class="layout__column layout__column--sidebar"
      >
        <div class="layout__row layout__row--body scroll">
          <slot name="sidebar" />
        </div>
      </div>

      <div
        class="layout__column layout__column--content"
      >
        <div class="layout__row layout__row--body scroll">
          <slot name="content" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Appbar from '../../../Appbar';
export default {
  components: {
    Appbar,
  },
  data() {
    return {
      IS_MAC,
    };
  },

};
</script>

<style lang="stylus" scoped>

  .layout
    background var(--Background-darkgrey)

    &__content
      display flex
      width 100%
      height calc(100vh - 96px)

    &__appbar
      width 100%
      height 48px
      box-sizing border-box
      background var(--Background-darkgrey)
      color var(--Font-primary)
      -webkit-app-region drag
      display flex
      flex-direction row
      justify-content stretch
      align-items center

    &__header
      width 100%
      height 48px
      padding 8px
      box-sizing border-box
      background-color var(--Background-white)
      color var(--Font-primary)
      display flex
      flex-direction row
      justify-content space-between
      align-items center
      box-shadow 0px -1px 12px rgba(0, 0, 0, 0.12), inset 0 -1px 0 0 var(--new-stroke-01)

      &--mac
        border-top-left-radius 10px
        border-top-right-radius 10px
        overflow hidden

    &__column
      display flex
      height 100%
      background-color var(--Background-white)
      color var(--Font-primary)
      flex-direction column

      &--sidebar
        flex 0 0 220px
        background-color var(--Background-white)

      &--content
        flex 1 1 auto
        box-shadow -1px 0 0 0 var(--new-stroke-01)

    &__row

      &--body
        flex 1 1 auto

</style>
