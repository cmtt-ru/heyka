<template>
  <layout>
    <template #header>
      <div class="settings-title l-pl-12 l-fw-m">
        {{ texts.header }}
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
          class="settings-link"
          :to="{name: 'settings'}"
          replace
        >
          {{ texts.general }}
        </router-link>
        <router-link
          class="settings-link"
          :to="{name: 'settings-devices'}"
          replace
        >
          {{ texts.devices }}
        </router-link>
        <router-link
          class="settings-link"
          :to="{name: 'settings-network'}"
          replace
        >
          {{ texts.network }}
        </router-link>
        <router-link
          class="settings-link"
          :to="{name: 'settings-about'}"
          replace
        >
          {{ texts.about }}
        </router-link>
        <router-link
          class="settings-link"
          :to="{name: 'settings-support'}"
          replace
        >
          {{ texts.support }}
        </router-link>
        <router-link
          v-if="IS_DEV"
          class="settings-link"
          :to="{name: 'styleguide'}"
        >
          {{ texts.styleguide }}
        </router-link>
        <router-link
          v-show="IS_DEV"
          class="settings-link"
          :to="{name: 'test-zone'}"
          replace
        >
          Test Zone
        </router-link>
        <div class="app-info">
          {{ prettyInfo }}
        </div>
      </div>
    </template>

    <template #content>
      <router-view />
    </template>
  </layout>
</template>

<script>
import Layout from './SettingsLayout';

export default {
  components: {
    Layout,
  },
  data() {
    return {
      info: this.$store.getters['app/getGeneralInfo'],
      IS_DEV,
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
    /**
     * Construct app&system info plate
     * @returns {string}
     */
    prettyInfo() {
      if (!this.info) {
        return;
      }

      return `${this.info.name}\nver. ${this.info.version}\n${this.info.system} ${this.info.systemVer}`;
    },
  },
  methods: {
    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.__backOrRedirect();
    },
  },
};
</script>

<style lang="stylus">
.app-info
  font-size 12px
  line-height 18px
  color var(--Text-secondary)
  white-space pre-line
  position absolute
  bottom 12px
  left 12px

.settings-link
  display block
  padding 6px 8px
  border-radius 6px
  font-size 14px
  line-height 16px
  text-decoration none
  margin 2px 4px 4px

  &.router-link-exact-active
    background var(--Background-darkgrey)
  &:hover
    background var(--Background-darkgrey-hover)
  &:active
    background var(--Background-darkgrey-active)

.settings-close
  color var(--UI-active)
  margin-right 10px
  cursor pointer

  &:hover
    color var(--UI-active-hover)
  &:active
    color var(--UI-active-active)

.settings-title
  height 40px
  line-height 40px
  font-size 16px
  font-weight bold

.layout__column--sidebar
    background var(--Background-white)

</style>
