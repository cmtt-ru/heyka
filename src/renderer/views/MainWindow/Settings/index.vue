<template>

    <layout>

      <template v-slot:sidebar-header>
        <div class="l-p-8 l-w-m">
          Settings
        </div>
      </template>

      <template v-slot:sidebar-body>
        <div class="l-p-8">
          <router-link class="link" to="/main-window/settings/">{{texts.general}}</router-link>
          <router-link class="link" to="/main-window/settings/devices">{{texts.devices}}</router-link>
          <router-link class="link" to="/main-window/settings/network">{{texts.network}}</router-link>
          <router-link class="link" to="/main-window/settings/about">{{texts.about}}</router-link>
          <router-link class="link" to="/main-window/settings/support">{{texts.support}}</router-link>
          <router-link class="link" to="/main-window/styleguide">{{texts.styleguide}}</router-link>
        </div>
      </template>

      <template v-slot:content-body>
        <div>
          <router-link class="close-strip" :to="{name: 'workspace'}"><ui-button
          :type="7"
          class="channel-info__more"
          size="small"
          icon="close">
          </ui-button></router-link>

          <div>
            <router-view></router-view>
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
  computed: {
    texts() {
      return this.$t('settings.labels');
    },
  },
};
</script>

<style lang="stylus">
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

.close-strip
  height 40px
  width 40px
  margin-left auto
  box-sizing border-box
  padding 8px
  display flex
  flex-direction row
  justify-content flex-end

.settings-page
  padding 0 12px 12px

.settings__label
  font-size 12px
  padding 12px 0 2px

.dropdown
  margin 6px 0

.switch
  padding 8px 0

</style>
