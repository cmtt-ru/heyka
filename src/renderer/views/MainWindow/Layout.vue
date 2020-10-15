<template>
  <div>
    <div
      :style="$themes.getColors('navbar')"
      class="layout__appbar"
    >
      <appbar />
    </div>
    <div class="layout">
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

};
</script>

<style lang="stylus">

  .layout
    display flex
    width 100%
    height calc(100vh - 48px)
    box-shadow 0px -1px 12px rgba(0, 0, 0, 0.12);

    &__appbar
      width 100%
      height 48px
      padding 8px
      box-sizing border-box
      background-color var(--new-appbar)
      color var(--text-0)
      -webkit-app-region drag
      display flex
      flex-direction row
      justify-content stretch
      align-items center

    &__column
      display flex
      height 100%
      background-color var(--app-bg)
      color var(--text-0)
      flex-direction column

      &--sidebar
        flex 0 0 200px

      &--content
        flex 1 1 auto

    &__row

      &--header
        flex 0 0 39px

      &--body
        flex 1 1 auto

</style>
