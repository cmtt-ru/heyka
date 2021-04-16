<template>
  <layout>
    <template #header>
      <div class="settings-title l-pl-12 l-fw-m">
        {{ texts.pageName }}
      </div>
      <div
        class="settings-close"
        @click="__backOrRedirect()"
      >
        {{ $t('techTexts.close') }}
      </div>
    </template>

    <template #sidebar>
      <div class="l-p-8">
        <router-link
          class="editprofile-link"
          :to="{name: 'edit-profile-main'}"
          replace
        >
          {{ texts.mainSettings }}
        </router-link>
        <router-link
          class="editprofile-link"
          :to="{name: 'edit-profile-social'}"
          replace
        >
          {{ texts.loginSettings }}
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
      return this.$t('workspace.userSettings');
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

.editprofile-link
  display block
  padding 6px 8px
  border-radius 6px
  font-size 14px
  line-height 16px
  text-decoration none
  color var(--text-0)
  margin 2px 4px 4px

  &:hover:not(.router-link-exact-active)
    background-color var(--new-UI-07)

  &.router-link-exact-active
    background-color var(--new-UI-07)

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
