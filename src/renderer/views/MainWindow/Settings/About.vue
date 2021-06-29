<template>
  <div class="settings-page">
    <!-- <svg-icon
      class="about-logo"
      name="logo"
      width="40"
      height="35"
    /> -->
    <div class="settings__label">
      {{ info.name }}
    </div>

    <div class="about-version">
      {{ texts.version }} {{ info.version }}
    </div>

    <a
      class="about-link"
      target="_blank"
      :href="termsLink"
    >{{ texts.notice }}</a>

    <ui-button
      :type="1"
      size="large"
      class="check-for-updates"
      @click="checkForUpdatesHandler"
    >
      {{ texts.checkUpdates }}
    </ui-button>

    <div class="changelog">
      <div
        v-for="change in CHANGELOG"
        :key="change.version"
      >
        <div class="changelog__version">
          {{ change.version }}
        </div>

        <div
          v-if="change.text"
          class="changelog__text"
        >
          {{ change.text }}
        </div>

        <ul>
          <li
            v-for="(item, i) in change.list"
            :key="i"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { CHANGELOG } from '@/changelog';
import UiButton from '@components/UiButton';
import { WEB_URL } from '@sdk/Constants';
import notify from '@libs/notify';

export default {

  components: {

    UiButton,
  },

  data() {
    return {
      CHANGELOG,
      info: this.$store.getters['app/getGeneralInfo'],
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.about');
    },

    termsLink() {
      return `${WEB_URL}/terms-conditions`;
    },
  },

  methods: {
    checkForUpdatesHandler() {
      window.ipcRenderer.removeAllListeners('update-not-available');
      window.ipcRenderer.removeAllListeners('update-downloading');

      window.ipcRenderer.send('update-check');

      window.ipcRenderer.once('update-not-available', () => {
        this.noUpdate();
      });

      window.ipcRenderer.once('update-downloading', () => {
        this.updateDownloading();
      });
    },

    /**
     * Show update install notification
     * @returns {void}
     */
    async noUpdate() {
      notify('autoUpdate.noUpdate', {
        lifespan: 3000,
      });
    },

    /**
     * Show update downloading notification
     * @returns {void}
     */
    async updateDownloading() {
      notify('autoUpdate.downloading', {
        lifespan: 3000,
      });
    },
  },
};
</script>

<style scoped lang="stylus">
@import './styles'

.about-version
  padding-top 4px
  font-weight 400

.about-link
  padding-top 8px
  color var(--UI-active)
  font-weight 400

.check-for-updates
  margin-top 14px

.changelog
  display flex
  flex-direction column
  text-align left
  width 100%
  padding 0 0 20px 0
  box-sizing border-box
  align-items flex-start
  justify-content center
  font-size 14px
  font-weight 400
  user-select text

  &__version
    font-weight bold
    font-size 18px
    line-height 28px
    padding-bottom 9px
    margin-top 16px
    user-select text

  &__text
    white-space pre-line
    line-height 19px
    margin-bottom 10px
    user-select text

  ul
    padding-left 17px

    li
      margin-bottom 10px
      user-select text
</style>
