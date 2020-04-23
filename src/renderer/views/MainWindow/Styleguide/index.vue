<template>

    <layout>

      <template v-slot:sidebar-header>
        <div class="l-p-8 l-fw-m">
          Styleguide
        </div>
      </template>

      <template v-slot:content-header>
        <div class="l-p-8 l-fw-m">

        </div>
      </template>

      <template v-slot:sidebar-body>
        <div class="l-p-8">
          <router-link class="link" :to="{name: 'styleguide-buttons'}">Buttons</router-link>
          <router-link class="link" :to="{name: 'styleguide-lists'}">Lists</router-link>
          <router-link class="link" :to="{name: 'styleguide-forms'}">Forms</router-link>
          <br>
          <br>
          <router-link class="link" :to="{name: 'workspace'}">Exit</router-link>
        </div>
      </template>

      <template v-slot:content-body>
        <div class="l-p-8">
          <router-view></router-view>
        </div>
      </template>

    </layout>

</template>

<script>
import Layout from './../Layout';

export default {
  components: {
    Layout,
  },
  data() {
    return {

    };
  },
  created() {

  },
};
</script>

<style lang="stylus" scoped> //? scoped или нет? пока убрал, чтобы не мешало в списке каналов
  .link
    display block
    padding 4px 8px
    border-radius 4px
    font-size 14px
    text-decoration none
    color var(--text-0)
    margin-bottom 2px

    &:hover:not(.router-link-exact-active)
      background-color var(--item-bg-hover)

  .router-link-exact-active
    background-color var(--item-bg-active)
    box-shadow 0 1px 2px rgba(0, 0, 0, 0.1)

  pre
    display inline-flex
    background var(--item-bg-hover)
    padding 0 4px
    border-radius 4px
    border 1px solid var(--stroke-3)
    font-size 12px
    margin-top 4px
    user-select text !important

</style>
