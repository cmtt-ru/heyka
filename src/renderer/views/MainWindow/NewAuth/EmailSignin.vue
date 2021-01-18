<template>
  <div class="auth-page">
    <h1>{{ texts.title }}</h1>

    <ui-form
      class="reset-form"
      @submit="loginHandler()"
    >
      <div
        v-if="IS_DEV"
        class="dev-server l-mb-6"
      >
        {{ texts.devServer }}
      </div>

      <ui-input
        v-model="login.email"
        class="l-mb-12"
        placeholder="example@mail.com"
        email
        required
      />

      <ui-input
        v-model="login.password"
        class="l-mb-6"
        required
        type="password"
        placeholder="******"
        enter-submit
      />

      <router-link
        :to="{name:'new-auth-email-reset', params: {login: login.email}}"
      >
        <ui-button
          :type="9"
          size="small"
          class="l-mb-18"
        >
          {{ texts.reset }}
        </ui-button>
      </router-link>

      <ui-button
        :type="1"
        :loading="loginInProgress"
        size="large"
        wide
        submit
      >
        {{ texts.login }}
      </ui-button>

      <div class="info">
        <div class="info__text">
          {{ texts.newMember }}
        </div>
        <div
          class="info__link"
          @click="signupHandler"
        >
          {{ texts.signup }}
        </div>
      </div>
    </ui-form>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';
import { authFileStore, heykaStore } from '@/store/localStore';
import { WEB_URL } from '@sdk/Constants';
import { errorMessages } from '@api/errors/types';

export default {
  components: {
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      login: {
        email: heykaStore.get('loginEmail', ''),
        password: IS_DEV ? 'heyka-password' : '',
      },
      loginInProgress: false,
      IS_DEV,
    };
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('newAuth.email');
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
    async loginHandler() {
      this.loginInProgress = true;

      try {
        await this.$API.auth.signin({ credentials: this.login });

        if (IS_ELECTRON) {
          heykaStore.set('loginEmail', this.login.email);
          await this.$store.dispatch('initial');
        } else {
          heykaStore.set('loginEmail', this.login.email);

          if (authFileStore.get('inviteCode')) {
            this.$API.workspace.joinByCode(authFileStore.get('inviteCode'));
            authFileStore.set('inviteCode', null);
          }

          await this.$router.push({
            name: 'landing',
          });
        }
      } catch (err) {
        if (err.response.data.message === errorMessages.emailOrPasswordAreInvalid ||
            err.response.data.message === errorMessages.invalidRequestPayloadInput) { // ? maybe not needed
          const notification = {
            data: {
              text: this.notifTexts.wrongPass,
            },
          };

          await this.$store.dispatch('app/addNotification', notification);
        }
      } finally {
        this.loginInProgress = false;
      }
    },

    /**
     * Signup handler
     * @returns {void}
     */
    async signupHandler() {
      if (IS_ELECTRON) {
        window.open(`${WEB_URL}/auth/register`);
      } else {
        this.$router.push({ name: 'new-auth-email-signup' });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .info
    display flex
    flex-direction row
    margin-top 32px

    &__link
      margin-left 8px
      color var(--text-tech-2)
      cursor pointer

</style>
