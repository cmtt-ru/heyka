<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <ui-form
      class="reset-form"
      @submit="resetHandler"
    >
      <ui-input
        v-model="login.email"
        class="l-mb-12"
        placeholder="example@mail.com"
        email
        required
      />
      <ui-button
        :type="12"
        wide
        class="l-mb-8"
        size="large"
        submit
      >
        {{ texts.reset }}
      </ui-button>

      <ui-button
        :type="10"
        wide
        size="large"
        @click="$emit('go-back')"
      >
        {{ texts.cancel }}
      </ui-button>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      login: {
        email: this.$route.params.login || '',
      },
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('newAuth.reset');
    },

    /**
     * Get notification texts from I18n-locale file
     * @returns {object}
     */
    notifTexts() {
      return this.$t('notifications.login');
    },
  },

  methods: {
    async resetHandler() {
      try {
        await this.$API.auth.discardPass({ email: this.login.email });
      } catch (err) {
        console.log('ERROR:', err);
      }

      const notification = {
        data: {
          text: this.notifTexts.passReset,
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
