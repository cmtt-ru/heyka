<template>
  <layout>
    <template #sidebar-header>
      <div class="settings-title l-pl-12 l-fw-m">
        Styleguide
      </div>
    </template>

    <template #sidebar-body>
      <div class="l-p-8">
        <router-link
          class="link"
          :to="{name: 'styleguide-buttons'}"
        >
          Buttons
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-lists'}"
        >
          Lists
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-forms'}"
        >
          Forms
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-notifications'}"
        >
          Notifications
        </router-link>
      </div>
    </template>

    <template #content-body>
      <div>
        <router-link
          class="close-strip"
          :to="{name: 'settings'}"
        >
          <ui-button
            propagation
            :type="7"
            size="small"
            icon="close"
          />
        </router-link>

        <div class="l-p-8">
          <router-view />
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from './../Layout';
import UiButton from '@components/UiButton';

export default {
  components: {
    Layout,
    UiButton,
  },
  data() {
    return {

    };
  },
  created() {

  },
};
</script>

<style lang="stylus" scoped>
  .link
    display block
    padding 4px
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
