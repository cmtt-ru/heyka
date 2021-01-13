<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <ui-form
      class="reset-form"
      @submit="registerHandler()"
    >
      <ui-input
        v-model="newUser.name"
        class="l-mb-12"
        :placeholder="texts.name"
        :minlength="3"
        required
      />

      <ui-input
        v-model="newUser.email"
        class="l-mb-12"
        :placeholder="texts.email"
        email
        required
      />

      <ui-input
        v-model="newUser.password"
        required
        :minlength="8"
        :maxlength="120"
        type="password"
        class="l-mb-24"
        :placeholder="texts.password"
        enter-submit
      />

      <ui-button
        :type="1"
        wide
        submit
        size="large"
      >
        {{ texts.register }}
      </ui-button>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';
import { determineLocale } from '@sdk/translations/i18n';
import { authFileStore } from '@/store/localStore';
import { errorMessages } from '@api/errors/types';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      newUser: {
        name: '',
        email: '',
        password: '',
        lang: determineLocale(),
      },
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('newAuth.signup');
    },
  },

  methods: {
    async registerHandler() {
      try {
        const res = await this.$API.auth.signup({ user: this.newUser });

        if (authFileStore.get('inviteCode')) {
          this.$API.workspace.joinByCode(authFileStore.get('inviteCode'));
          authFileStore.set('inviteCode', null);
        }

        console.log(res);

        this.$router.push({ name: 'regSuccess' });
      } catch (err) {
        if (err.response.data.message === errorMessages.emailExists) {
          const notification = {
            data: {
              text: errorMessages.emailExists,
            },
          };

          await this.$store.dispatch('app/addNotification', notification);
        }
        console.log('ERROR:', err);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .info
    display flex
    flex-direction row
    margin-top 24px

    &__link
      margin-left 8px
      color var(--text-tech-2)
      cursor pointer

</style>
