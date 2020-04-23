<template>
  <div class="settings-page">
    <div class="privacy-text">{{texts.transparency}}</div>
    <textarea readonly cols="30" rows="10">Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae dignissimos nam illo quasi rem modi sed architecto voluptates aperiam quas? Ea aperiam in nihil, assumenda atque a similique eaque delectus! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Natus pariatur beatae dolore reiciendis eveniet laudantium incidunt eaque quos laborum nobis. Saepe hic reiciendis minima at, iure vero molestiae molestias provident! Lorem ipsum dolor sit amet consectetur adipisicing elit. Non nam aut corrupti distinctio hic rem a ipsum rerum officia eaque! Sunt commodi sint obcaecati a distinctio earum ratione vel ipsam?</textarea>
    <div class="settings__label">{{texts.googleLabel}}</div>
    <ui-switch v-model="analytics" :text="texts.googleSwitch"/>
  </div>
</template>

<script>

import { UiSwitch } from '@components/Form';

export default {
  components: {
    UiSwitch,
  },
  data() {
    return {
      analytics: null,
    };
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('settings.network');
    },
  },

  watch: {
    analytics: 'saveAnalytics',
  },

  methods: {
    saveAnalytics() {
      this.$store.dispatch('app/setAnalytics', this.analytics);
    },
  },

  created() {
    this.analytics = this.$store.getters['app/getAnalytics'];
  },
};
</script>

<style scoped lang="stylus">
.settings-page
  padding 8px 20px 12px

.privacy-text
  line-height 22px

textarea
  outline none
  resize none
  background-color var(--input)
  border 0.5px solid var(--stroke-3)
  color currentColor
  border-radius 4px
  margin-top 14px
  padding 8px 12px 16px
  width 100%
  box-sizing border-box
  font-size 12px
  line-height 20px

</style>