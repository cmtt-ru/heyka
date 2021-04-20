<template>
  <layout>
    <div class="wrapper">
      <div class="wrapper__content">
        <svg-icon
          name="doggy"
          :width="136"
          :height="123"
        />

        <h4>
          {{ texts['title'] }}
        </h4>
        <p>
          {{ $t('noWorkspace.description', [myEmail]) }}
        </p>

        <ui-button
          :type="1"
          size="large"
          @click="createHandler"
        >
          {{ texts['create'] }}
        </ui-button>
      </div>
    </div>
  </layout>
</template>

<script>
import Layout from './Layout';
import UiButton from '@components/UiButton';
import { WEB_URL } from '@sdk/Constants';
import { mapGetters } from 'vuex';

export default {
  components: {
    Layout,
    UiButton,
  },

  data() {
    return {

    };
  },

  computed: {
    ...mapGetters({
      myEmail: 'me/getMyEmail',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('noWorkspace');
    },
  },

  methods: {
    async createHandler() {
      const { code } = await this.$API.auth.link();
      const link = `${WEB_URL}/ws/create/${code}`;

      window.open(link);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .wrapper
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%

    &__content
      width 300px
      text-align center

      svg
        margin-bottom 30px

      h4
        font-size 16px
        line-height 24px
        font-weight 500
        margin-bottom 4px

      p
        line-height 22px
        font-weight 400
        margin-bottom 44px
</style>
