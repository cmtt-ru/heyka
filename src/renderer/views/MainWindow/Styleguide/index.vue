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
  color var(--new-UI-01)
  margin-right 10px
  cursor pointer

  &:hover
    color var(--new-UI-01-1) //? так ли?

.link
  display block
  padding 4px
  border-radius 4px
  font-size 14px
  text-decoration none
  margin-top 2px

  &:hover:not(.router-link-exact-active)
    background-color var(--new-UI-06)

.router-link-exact-active
  background-color var(--new-UI-09)
  box-shadow 0 1px 2px rgba(0, 0, 0, 0.1)

pre
  display inline-flex
  background var(--new-UI-06)
  padding 0 4px
  border-radius 4px
  border 1px solid var(--new-stroke-01)
  font-size 12px
  margin-top 4px
  user-select text !important

</style>
