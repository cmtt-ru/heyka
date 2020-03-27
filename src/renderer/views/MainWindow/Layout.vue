<template>
  <div>
    <div class="layout">

      <div :style="$themes.getColors('navbar')" class="layout__column layout__column--sidebar">

        <div class="layout__row layout__row--header" v-if="$slots['sidebar-header']">
          <slot name="sidebar-header"></slot>
        </div>

        <div class="layout__row">
          <slot name="sidebar-body"></slot>
        </div>

      </div>

      <div :style="$themes.getColors('content')" class="layout__column layout__column--content">

        <div class="layout__row layout__row--header" v-if="$slots['content-header']">
          <slot name="content-header"></slot>
        </div>

        <div class="layout__row">
          <slot name="content-body"></slot>
        </div>

      </div>

    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {};
  },
  created() {

  },
};
</script>

<style lang="stylus">

  .layout
    display flex
    width 100%
    height 100vh

    &__column
      height 100%

      &--sidebar
        width 200px
        flex 0 0 auto
        background-color var(--app-bg)
        color var(--text-0)

      &--content
        flex 3 0 auto
        background-color var(--app-bg)
        color var(--text-0)

    &__row
      &--header
        height 39px
        border-bottom 1px solid var(--line-stroke)

</style>
