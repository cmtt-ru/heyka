<template>
  <div>
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
        <div
          v-if="$slots['content-header']"
          class="layout__row layout__row--header"
        >
          <slot name="content-header" />
        </div>

        <div class="layout__row layout__row--body scroll">
          <slot name="content-body" />
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
        border-bottom 1px solid var(--line-stroke)
        -webkit-app-region drag

      &--body
        flex 1 1 auto

</style>
