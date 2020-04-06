<template>
  <div>
    <div class="layout">

      <div :style="$themes.getColors('navbar')" class="layout__column layout__column--sidebar">

        <div class="layout__row layout__row--header" v-if="$slots['sidebar-header']">
          <slot name="sidebar-header"/>
        </div>

        <div class="layout__row layout__row--body" v-bar>
          <div>
            <slot name="sidebar-body"/>
          </div>
        </div>

      </div>

      <div :style="$themes.getColors('content')" class="layout__column layout__column--content">

        <div class="layout__row layout__row--header" v-if="$slots['content-header']">
          <slot name="content-header"/>
        </div>

        <div class="layout__row layout__row--body" v-bar>
          <div>
            <slot name="content-body"/>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>

import Vue from 'vue';
import Vuebar from 'vuebar';
import '@styles/vuebar.styl';

Vue.use(Vuebar);

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
        width 200px

      &--content
        flex 1 1 auto

    &__row

      &--header
        flex 0 0 39px
        border-bottom 1px solid var(--line-stroke)

      &--body
        flex 1 1 auto

</style>
