<template>
  <div class="settings-page">

    <svg-icon
       class="about-logo"
      name="logo"
      width="40"
      height="35"/>

    <div class="about-name">{{info.name}}</div>
    <div class="about-version">{{texts.version}} {{info.version}}</div>

    <a class="about-link">{{texts.notice}}</a>
  </div>
</template>

<script>

// import UiButton from '@components/UiButton';
// import { UiSwitch, UiSelect, UiInput } from '@components/Form';

export default {
  components: {
    // UiSwitch,
    // UiSelect,
    // UiInput,
    // UiButton,
  },

  data() {
    return {
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
</style>