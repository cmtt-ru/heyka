<template>
  <div class="settings-page">
    <svg-icon
      class="about-logo"
      name="logo"
      width="40"
      height="35"
    />

    <div class="about-name">
      {{ info.name }}
    </div>
    <div class="about-version">
      {{ texts.version }} {{ info.version }}
    </div>

    <a class="about-link">{{ texts.notice }}</a>

    <ui-button
      :type="2"
      class="check-for-updates"
      @click="checkforUpdatesHandler"
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

        <div class="changelog__text">
          {{ change.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { CHANGELOG } from '@/changelog';
import UiButton from '@components/UiButton';

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
  },

  methods: {
    checkforUpdatesHandler() {
      ipcRenderer.send('update-check');

      ipcRenderer.once('update-not-available', () => {
        this.noUpdate();
      });
    },

    /**
     * Show update install notification
     * @returns {void}
     */
    async noUpdate() {
      const texts = this.$t('autoUpdate');

      const notification = {
        lifespan: 5000,
        data: {
          text: texts.noUpdate,
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },
  },
};
</script>

<style scoped lang="stylus">
@import './styles'

.settings-page
  padding-left  20px

.about-logo
  color transparent

.about-name
  padding-top 16px
  font-weight 500
  font-size 18px

.about-version
  padding-top 8px

.about-link
  padding-top 12px
  color var(--color-2)

.check-for-updates
  margin 16px auto
.changelog
  display flex
  text-align left
  width 100%
  padding 20px 0
  box-sizing border-box
  align-items flex-start
  justify-content center
  font-size 12px

  &__version
    font-size 2em
    padding-bottom 15px

  &__text
    color var(--text-0)
    white-space pre-line
    line-height 20px
</style>
