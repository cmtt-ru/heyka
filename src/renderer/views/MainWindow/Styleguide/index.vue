<template>
  <layout>
    <template #header>
      <div class="settings-title l-pl-12 l-fw-m">
        Styleguide
      </div>
      <div
        class="settings-close"
        @click="__backOrRedirect()"
      >
        {{ texts.close }}
      </div>
    </template>

    <template #sidebar>
      <div class="l-p-8">
        <router-link
          class="link"
          :to="{name: 'styleguide-buttons'}"
          replace
        >
          Buttons
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-lists'}"
          replace
        >
          Lists
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-forms'}"
          replace
        >
          Forms
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-notifications'}"
          replace
        >
          Notifications
        </router-link>
        <router-link
          class="link"
          :to="{name: 'styleguide-tabs'}"
          replace
        >
          Tabs
        </router-link>
      </div>
    </template>

    <template #content>
      <div>
        <div class="l-p-8">
          <router-view />
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from '../Settings/SettingsLayout';

export default {
  components: {
    Layout,
  },
  data() {
    return {

    };
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.labels');
    },
  },
};
</script>

<style lang="stylus" scoped>
.settings-close
  color var(--UI-active)
  margin-right 10px
  cursor pointer

  &:hover
    color var(--UI-active-hover)
  &:active
    color var(--UI-active-active)

.link
  display block
  padding 4px
  border-radius 4px
  font-size 14px
  text-decoration none
  margin-top 2px

  &.router-link-exact-active
    background var(--Background-darkgrey)
  &:hover
    background var(--Background-darkgrey-hover)
  &:active
    background var(--Background-darkgrey-active)

</style>
