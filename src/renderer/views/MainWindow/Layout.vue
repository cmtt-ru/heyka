<template>
  <div
    class="mainwindow-wrapper"
    :class="{'mainwindow-wrapper--mac': IS_MAC}"
  >
    <div
      :style="$themes.getColors('navbar')"
      class="layout__appbar"
      :class="{'layout__appbar--mac': IS_MAC}"
    >
      <appbar />
    </div>
    <div
      class="layout"
      :class="{'layout--mac': IS_MAC}"
    >
      <div
        :style="$themes.getColors('navbar')"
        class="layout__column layout__column--sidebar"
      >
        <div
          v-if="$slots['sidebar-header']"
          class="layout__row layout__row--header"
        >
          <slot name="sidebar-header" />
        </div>

        <div class="layout__row layout__row--body scroll">
          <slot name="sidebar-body" />
        </div>
      </div>

      <div
        :style="$themes.getColors('content')"
        class="layout__column layout__column--content"
      >
        <div class="layout__row layout__row--body scroll">
          <slot name="content-body" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Appbar from './Appbar';
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

<style lang="stylus">

  .mainwindow-wrapper
    background-color var(--new-bg-03)

    &--mac
      background-color var(--new-bg-02)

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
      padding 8px
      box-sizing border-box
      background-color var(--new-bg-03)
      color var(--text-0)
      -webkit-app-region drag
      display flex
      flex-direction row
      justify-content stretch
      align-items center

      &--mac
        background-color transparent

    &__column
      display flex
      height 100%
      background-color var(--new-bg-04)
      color var(--text-0)
      flex-direction column

      &--sidebar
        flex 0 0 220px
        background-color var(--new-bg-01)

      &--content
        flex 1 1 auto

    &__row

      &--header
        flex 0 0 39px

      &--body
        flex 1 1 auto

</style>
