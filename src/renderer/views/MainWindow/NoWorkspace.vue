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
          Have no access to any workspace
        </h4>
        <p>
          Create a new team or ask your co-workers
          to invite you. Your email is ds@cmtt.ru
        </p>

        <ui-button
          :type="1"
          size="large"
          @click="createHandler"
        >
          Create workspace
        </ui-button>
      </div>
    </div>
  </layout>
</template>

<script>
import Layout from './Layout';
import UiButton from '@components/UiButton';
import { WEB_URL } from '@sdk/Constants';

export default {
  components: {
    Layout,
    UiButton,
  },

  data() {
    return {

    };
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
        font-size 14px
        line-height 22px
        font-weight 400
        margin-bottom 44px
</style>
