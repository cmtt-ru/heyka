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
          {{ texts.welcome }}
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
              <span>{{ texts.or }}</span>
            </div>
          </div>
          <ui-form
            v-show="!passReset"
            class="reset-form"
            @submit="loginHandler()"
          >
            <div
              v-if="IS_DEV"
              class="dev-server"
            >
              {{ texts.devServer }}
            </div>
            <ui-input
              v-model="login.email"
              icon="mail"
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
              enter-submit
            />
            <ui-button
              :type="6"
              wide
              class="login__button"
              :loading="loginInProgress"
              submit
            >
              {{ texts.login }}
            </ui-button>
            <div class="info">
              <div class="info__text">
                {{ texts.forgot }}
              </div>
              <div
                class="info__link"
                @click="toggleReset"
              >
                {{ texts.reset }}
              </div>
            </div>
          </ui-form>
          <ui-form
            v-show="passReset"
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
              enter-submit
            />
            <ui-button
              :type="12"
              wide
              class="login__button login__button--caps"
              submit
            >
              {{ texts.reset }}
            </ui-button>
            <ui-button
              :type="10"
              wide
              class="login__button"
              @click="toggleReset"
            >
              {{ texts.cancel }}
            </ui-button>
          </ui-form>

          <div class="info">
            <div class="info__text">
              {{ texts.newMember }}
            </div>
            <div
              class="info__link"
              @click="registerHandler"
            >
              {{ texts.signup }}
            </div>
          </div>
          <br>
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
import { WEB_URL } from '@sdk/Constants';
import { heykaStore } from '@/store/localStore';
import connectionCheck from '@sdk/classes/connectionCheck';

const http = require('http');

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
      loginInProgress: false,
      login: {
        email: heykaStore.get('loginEmail', ''),
        password: IS_DEV ? 'heyka-password' : '',
      },
      IS_DEV,
    };
  },

  computed: {
    /**
     * Get notification texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('login');
    },

    /**
     * Get notification texts from I18n-locale file
     * @returns {object}
     */
    notifTexts() {
      return this.$t('notifications.login');
    },
  },

  mounted() {
    connectionCheck.appStatusVisibleState(false);

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

    /**
     * Open web server to listen for magic login from web
     *
     * @param {number} portIndex - port to listen to
     * @returns {void}
     */
    createLocalServer(portIndex = 0) {
      if (portIndex === PORTS.length) {
        return;
      }

      const srvr = http.createServer((req, res) => {
        console.log(req.url);
        this.$store.dispatch('useAuthLink', req.url.substr(1));
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
    },

    /**
     * Show/hide reset block
     *
     * @returns {void}
     */
    toggleReset() {
      this.passReset = !this.passReset;
    },

    /**
     * Log in with SNS
     *
     * @param {string} socialName - SNS name
     * @returns {void}
     */
    async socialHandler(socialName) {
      const link = `${WEB_URL}/auth/social/${socialName}/login`;

      window.open(link);
    },

    /**
     * Open registration page
     *
     * @param {string} socialName - SNS name
     * @returns {void}
     */
    async registerHandler() {
      const link = `${WEB_URL}/auth/register`;

      window.open(link);
    },

    /**
     * Log in with email+pass
     *
     * @returns {void}
     */
    async loginHandler() {
      this.loginInProgress = true;

      try {
        await this.$API.auth.signin({ credentials: this.login });

        heykaStore.set('loginEmail', this.login.email);

        await this.$store.dispatch('initial');
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
     * Reset password
     *
     * @returns {void}
     */
    async resetHandler() {
      try {
        await this.$API.auth.discardPass({ email: this.login.email });
      } catch (err) {
        console.log('ERROR:', err);
      }

      this.toggleReset();
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

<style scoped lang="stylus">
.currently-not-needed
  opacity 0.5
  pointer-events none

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

    &--caps
      text-transform uppercase

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
