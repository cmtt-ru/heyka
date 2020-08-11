<template>
  <layout>
    <template #sidebar-body>
      <img
        class="sidebar-image"
        :src="coverSrc"
      >
    </template>

    <template #content-body>
      <div class="page l-p-18">
        <p class="l-fs-18">
          Welcome to Heyka
        </p>
        <div class="page__content">
          <div class="currently-not-needed">
            <ui-button
              :type="3"
              wide
              class="sns-button"
              @click="socialHandler('slack')"
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
              @click="socialHandler('google')"
            >
              Google
            </ui-button>

            <div class="or-delimiter">
              <span>or</span>
            </div>
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
            <ui-button
              :type="10"
              wide
              class="login__button"
              @click="toggleReset"
            >
              cancel
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
var http = require('http');

// eslint-disable-next-line no-magic-numbers
const PORTS = [9615, 48757, 48852, 49057, 49086];

export default {
  components: {
    Layout,
    UiButton,
    UiForm,
    UiInput,
  },

  data() {
    return {
      coverSrc: null,
      passReset: false,
      login: {
        email: 'ivanb@cmtt.ru',
        password: 'VT3O2O',
      },
    };
  },

  mounted() {
    this.createLocalServer();

    const hour = new Date().getHours();
    const morning = 13;
    const evening = 17;

    if (hour < morning || hour > evening) {
      this.coverSrc = require('@assets/img/cover_night.png');
    } else {
      this.coverSrc = require('@assets/img/cover_day.png');
    }
  },

  methods: {

    createLocalServer(portIndex = 0) {
      const srvr = http.createServer((req, res) => {
        console.log(req.url);
        this.magicSignIn(req.url.substr(1));
        res.end('heyka');
        srvr.close();
      });

      srvr.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          srvr.close();
          console.log('PORT IS IN USE:', PORTS[portIndex]);
          this.createLocalServer(portIndex + 1);
        }
      });

      srvr.listen(PORTS[portIndex], '127.0.0.1');
      console.log(srvr);
    },

    async magicSignIn(authLink) {
      try {
        await this.$API.auth.signinByLink(authLink);

        await this.$store.dispatch('initial');

        await this.$router.replace({
          name: 'workspace',
        });
      } catch (err) {
        console.log('bad auth link? how?');
      }
    },

    toggleReset() {
      console.log(this.passReset);
      this.passReset = !this.passReset;
    },

    async socialHandler(socialName) {
      const baseUrl = IS_DEV ? process.env.VUE_APP_DEV_URL : process.env.VUE_APP_PROD_URL;
      const link = `${baseUrl}/auth/social/${socialName}/login`;

      window.open(link); // TODO: can replace with window.open (see main index.js)
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
.currently-not-needed
  display none

.sidebar-image
    width 100%
    height 100%
    display block
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
  min-height 180px
  display flex
  flex-direction column
  justify-content top
</style>
