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
          class="link"
          :to="{name: 'settings'}"
        >
          {{ texts.general }}
        </router-link>
        <router-link
          class="link"
          :to="{name: 'settings-devices'}"
        >
          {{ texts.devices }}
        </router-link>
        <router-link
          class="link"
          :to="{name: 'settings-network'}"
        >
          {{ texts.network }}
        </router-link>
        <router-link
          class="link"
          :to="{name: 'settings-about'}"
        >
          {{ texts.about }}
        </router-link>
        <router-link
          class="link"
          :to="{name: 'settings-support'}"
        >
          {{ texts.support }}
        </router-link>
        <router-link
          v-if="dev"
          class="link"
          :to="{name: 'styleguide'}"
        >
          {{ texts.styleguide }}
        </router-link>
        <div class="app-info">
          {{ prettyInfo }}
        </div>
      </div>
    </template>

    <template #content-body>
      <div>
        <router-link
          class="close-strip"
          :to="{name: 'workspace'}"
        >
          <ui-button
            :type="7"
            size="small"
            icon="close"
            propagation
          />
        </router-link>

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
      dev: process.env.NODE_ENV !== 'production',
      info: this.$store.getters['app/getGeneralInfo'],
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
};
</script>

<style lang="stylus">
.app-info
  font-size 10px
  color var(--text-1)
  white-space pre-line
  padding 4px

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

</style>
