<template>
  <layout>
    <template #sidebar-body>
      <img
        width="100%"
        class="sidebar-image"
        src="https://leonardo.osnova.io/0658b525-8db3-fe95-69bd-fd64537802c6/"
      >
    </template>

    <template #content-body>
      <div class="page l-p-18">
        <p class="l-fs-18">
          Welcome to Heyka
        </p>
        <div class="page__content">
          <ui-button
            :type="3"
            wide
            class="sns-button"
            @click="_notImplemented"
          >
            Slack
            <svg-icon
              slot="right"
              color="var(--icon-1)"
              name="close"
              size="medium"
            />
          </ui-button>
          <ui-button
            :type="3"
            wide
            class="sns-button"
            @click="socialHandler('facebook')"
          >
            Facebook
          </ui-button>
          <ui-button
            :type="3"
            wide
            class="sns-button"
            @click="_notImplemented"
          >
            Google
          </ui-button>

          <div class="or-delimiter">
            <span>or</span>
          </div>
          <ui-form
            v-if="!passReset"
            class="reset-form"
            @submit="loginHandler()"
          >
            <ui-input
              v-model="login.email"
              icon="user"
              class="login__input"
              placeholder="example@mail.com"
              email
              required
            />
            <ui-input
              v-model="login.password"
              icon="lock"
              required
              type="password"
              class="login__input"
              placeholder="******"
            />
            <ui-button
              :type="6"
              wide
              class="login__button"
              submit
            >
              LOGIN
            </ui-button>
            <div class="info">
              <div class="info__text">
                Forgot your password?
              </div>
              <div
                class="info__link"
                @click="toggleReset"
              >
                Reset
              </div>
            </div>
          </ui-form>
          <ui-form
            v-if="passReset"
            class="reset-form"
            @submit="resetHandler"
          >
            <ui-input
              v-model="login.email"
              icon="user"
              class="login__input"
              placeholder="example@mail.com"
              email
              required
            />
            <ui-button
              :type="12"
              wide
              class="login__button"
              submit
            >
              RESET
            </ui-button>
          </ui-form>

          <div class="info">
            <div class="info__text">
              Not a member?
            </div>
            <div
              class="info__link"
              @click="_notImplemented"
            >
              Sign up now
            </div>
          </div>
          <br>
          <div class="info">
            <div class="info__text">
              Have a temporary link?
            </div>
            <router-link
              :to="{ name: 'temp'}"
              class="info__link"
            >
              Enter it here
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from './../Layout';
import UiButton from '@components/UiButton';
import { UiForm, UiInput } from '@components/Form';
import { errorMessages } from '@api/errors/types';

export default {
  components: {
    Layout,
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      passReset: false,
      login: {
        email: 'ivanb@cmtt.ru',
        password: 'VT3O2O',
      },
    };
  },

  methods: {

    toggleReset() {
      console.log(this.passReset);
      this.passReset = !this.passReset;
    },

    async socialHandler(sns) {
      const res = await this.$API.auth.signinBySocial(sns);

      console.log(res);
    },

    async loginHandler() {
      try {
        await this.$API.auth.signin({ credentials: this.login });

        await this.$store.dispatch('initial');

        await this.$router.replace({
          name: 'workspace',
        });
      } catch (err) {
        console.log('ERROR:', err);
        if (err.response.data.message === errorMessages.invalidRequestPayloadInput) {
          const notification = {
            data: {
              text: 'Wrong email/password!',
            },
          };

          await this.$store.dispatch('app/addNotification', notification);
        }
      }
    },

    async resetHandler() {
      try {
        // await this.$API.auth.resetPass(this.login.email);
        this.toggleReset();
        const notification = {
          data: {
            text: 'Check your email inbox!',
          },
        };

        await this.$store.dispatch('app/addNotification', notification);
      } catch (err) {
        console.log('ERROR:', err);
      }
    },
  },

};
</script>

<style scoped lang="stylus">
.sidebar-image
    width 100%
    height 100%
    object-fit cover
    object-position 0 0

.page
    height 100%
    box-sizing border-box
    display flex
    flex-direction column

    &__content
        display flex
        flex-direction column
        justify-content center
        flex-grow 2

.or-delimiter
    width 100%
    text-align center
    box-shadow 0 1px 0 0 var(--stroke-3)
    line-height 0.1em
    margin 20px 0 24px

    & span
        background var(--app-bg)
        padding 0 10px

.sns-button
    margin-bottom 12px

.login__input
    margin 6px 0

    &:first-of-type
        margin-bottom 12px

.login__button
    margin-top 12px

.info
    display flex
    flex-direction row
    margin-top 24px

    &__link
        margin-left 8px
        color var(--text-tech-2)
        cursor pointer

.reset-form
  min-height 175px
  display flex
  flex-direction column
  justify-content top
</style>
