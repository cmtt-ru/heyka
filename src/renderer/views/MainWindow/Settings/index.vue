<template>
  <layout>
    <template #sidebar-header>
      <div class="settings-title l-pl-12 l-fw-m">
        {{ texts.header }}
      </div>
    </template>

    <template #sidebar-body>
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
          replace
        >
          {{ texts.styleguide }}
        </router-link>
        <router-link
          v-if="IS_DEV"
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

    <template #content-body>
      <div>
        <div class="close-strip">
          <ui-button
            :type="7"
            size="small"
            icon="close"
            @click="closeHandler"
          />
        </div>

        <div>
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
      this.$router.back();
    },
  },
};
</script>

<style lang="stylus">
.app-info
  font-size 12px
  line-height 18px
  color var(--new-UI-04)
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
  color var(--text-0)
  margin 0 4px 4px

  &:hover:not(.router-link-exact-active)
    background-color var(--new-UI-07)

  &.router-link-exact-active
    background-color var(--new-UI-07)

.close-strip
  height 40px
  width 40px
  margin-left auto
  box-sizing border-box
  padding 8px
  display flex
  flex-direction row
  justify-content flex-end

.settings-title
  height 40px
  line-height 40px
  font-size 16px
  font-weight bold

.layout__column--sidebar
    background-color var(--new-bg-04)

</style>
