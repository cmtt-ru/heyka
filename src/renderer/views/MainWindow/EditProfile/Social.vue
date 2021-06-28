<template>
  <div
    class="edit-profile-page"
  >
    <div>
      <div class="link-social-accout">
        <ui-button
          :type="17"
          icon="slack"
          wide
          class="login-button"
          :class="{'login-button--active': socialAuth.slack}"
          @click="socialHandler('slack')"
        >
          Slack
          <div
            v-if="socialAuth.slack"
            slot="right"
            class="close-button-wrapper"
            @click.stop="detachSocialHandler('slack')"
          >
            <svg-icon
              name="close"
              size="medium"
            />
          </div>
        </ui-button>

        <ui-button
          :type="17"
          icon="facebook"
          :wide="true"
          class="login-button"
          :class="{'login-button--active': socialAuth.facebook}"
          @click="socialHandler('facebook')"
        >
          Facebook
          <div
            v-if="socialAuth.facebook"
            slot="right"
            class="close-button-wrapper"
            @click.stop="detachSocialHandler('facebook')"
          >
            <svg-icon
              name="close"
              size="medium"
            />
          </div>
        </ui-button>

        <ui-button
          :type="17"
          icon="google"
          :wide="true"
          class="login-button"
          :class="{'login-button--active': socialAuth.google}"
          @click="socialHandler('google')"
        >
          Google
          <div
            v-if="socialAuth.google"
            slot="right"
            class="close-button-wrapper"
            @click.stop="detachSocialHandler('google')"
          >
            <svg-icon
              name="close"
              size="medium"
            />
          </div>
        </ui-button>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';
import { WEB_URL } from '@sdk/Constants';
import notify from '@libs/notify';
import { GA_EVENTS, trackEvent } from '@libs/analytics';

export default {
  components: {
    UiButton,
  },

  data() {
    return {
      socialName: null,
    };
  },

  computed: {
    ...mapGetters({
      socialAuth: 'me/getSocialAuth',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.userSettings');
    },
  },

  mounted() {
    DeepLink.on('social-link', ([status, error]) => {
      let text = '';

      if (status === 'true') {
        const socialName = this.socialName.charAt(0).toUpperCase() + this.socialName.slice(1);

        trackEvent(GA_EVENTS.socialLink(socialName));

        text = this.$t('workspace.userSettings.socialLinked', [ socialName ]);
      } else {
        text = decodeURIComponent(error);
      }

      notify(text, {
        lifespan: 3000,
        icon: 'tick',
      });

      this.socialName = null;
    });
  },

  beforeDestroy() {
    DeepLink.removeAllListeners('social-link');
  },

  methods: {
    /**
     * show "saved!" text after successful API request
     * @returns {void}
     */
    savedAnimation() {
      const text = this.$refs.savedText;

      if (text === undefined) {
        return;
      }
      text.classList.add('saved-text--hiding');
      const hideTime = 2000;

      setTimeout(() => {
        text.classList.remove('saved-text--hiding');
      }, hideTime);
    },

    /**
     * Connect account to SNS
     *
     * @param {string} socialName - SNS name
     * @returns {void}
     */
    async socialHandler(socialName) {
      if (this.socialAuth[socialName]) {
        return;
      }

      const { code } = await this.$API.auth.link();
      const link = `${WEB_URL}/auth/social/${socialName}/link/${code}`;

      this.socialName = socialName;

      window.open(link);
    },

    async detachSocialHandler(socialName) {
      await this.$store.dispatch('me/detachSocial', socialName);
    },
  },

};
</script>

<style lang="stylus" scoped>
$SAVE_FADE_TIME = 2s

.edit-profile-page
  height 100%
  display flex
  flex-direction column
  padding 0px 8px

.login-button
  margin-bottom 12px
  align-items center

  &--active
    background var(--Button-social)

.close-button-wrapper
  width 45px
  height 24px
  box-sizing border-box
  color var(--UI-active)
  margin-left -45px
  transform translateX(12px)
  border-top-right-radius 6px
  border-bottom-right-radius 6px
  display flex
  flex-direction row
  justify-content center
  align-items center
  border-left 1px solid var(--Button-social-secondary)

  &:hover
    background-color var(--Button-social-secondary)
    border-left 1px solid transparent
    height 100%
</style>
