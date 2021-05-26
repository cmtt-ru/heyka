<template>
  <div
    class="mainwindow-wrapper"
    :class="{'mainwindow-wrapper--mac': IS_MAC}"
  >
    <div />
    <div
      class="layout__appbar"
      :class="{'layout__appbar--mac': IS_MAC}"
    >
      <div class="resizing-padding" />
      <slot
        v-if="$slots['appbar-body']"
        name="appbar-body"
      />
      <appbar v-else />
    </div>
    <div
      class="layout"
      :class="{'layout--mac': IS_MAC}"
    >
      <div
        v-if="$slots['sidebar-body']"
        class="layout__column layout__column--sidebar"
      >
        <div class="layout__row layout__row--body scroll">
          <slot name="sidebar-body" />
        </div>
      </div>

      <div
        v-if="$slots['content-body']"
        class="layout__column layout__column--content"
      >
        <div class="layout__row layout__row--body scroll">
          <slot name="content-body" />
        </div>
      </div>

      <div
        v-if="$slots['default']"
        class="layout__column layout__column--content scroll"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import Appbar from '../../Appbar';
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
  .resizing-padding
    position absolute
    top 0
    right 0
    left 0
    width 100%
    height 6px
    z-index 5
    opacity 0
    -webkit-app-region no-drag

  .mainwindow-wrapper
    background-color var(--new-bg-03)

  .layout
    display flex
    width 100%
    height calc(100vh - 48px)
    box-shadow 0px -1px 12px rgba(0, 0, 0, 0.12)

    &--mac
      border-top-left-radius 10px
      border-top-right-radius 10px
      overflow hidden

    &__appbar
      width 100%
      height 48px
      box-sizing border-box
      background-color var(--new-bg-03)
      color var(--new-UI-02)
      -webkit-app-region drag
      display flex
      flex-direction row
      justify-content stretch
      align-items center

    &__column
      display flex
      height 100%
      background-color var(--Background-white)
      color var(--new-UI-02)
      flex-direction column

      &--sidebar
        flex 0 0 220px
        background-color var(--Background-grey)

      &--content
        flex 1 1 auto

    &__row

      &--header
        flex 0 0 39px

      &--body
        position relative
        flex 1 1 auto

</style>
