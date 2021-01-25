<template>
  <div
    v-if="me"
    class="edit-profile-page"
  >
    <div>
      <div class="link-social-accout">
        <ui-button
          :type="17"
          icon="slack"
          wide
          class="login-button"
          @click="socialHandler('slack')"
        >
          Slack
          <svg-icon
            v-if="!socialAuth.slack"
            slot="right"
            color="var(--icon-1)"
            name="close"
            size="medium"
            @click.native.stop="detachSocialHandler('slack')"
          />
        </ui-button>

        <ui-button
          :type="17"
          icon="facebook"
          :wide="true"
          class="login-button"
          @click="socialHandler('facebook')"
        >
          Facebook
          <svg-icon
            v-if="socialAuth.facebook"
            slot="right"
            color="var(--icon-1)"
            name="close"
            size="medium"
            @click.native.stop="detachSocialHandler('facebook')"
          />
        </ui-button>
        <ui-button
          :type="17"
          icon="google"
          :wide="true"
          class="login-button"
          @click="socialHandler('google')"
        >
          <svg-icon
            v-if="socialAuth.google"
            slot="right"
            color="var(--icon-1)"
            name="close"
            size="medium"
            @click.native.stop="detachSocialHandler('google')"
          />
          Google
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
      selectedChannel: 'myChannel',
      me: 'myInfo',
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

        text = this.$t('workspace.userSettings.socialLinked', [ socialName ]);
      } else {
        text = decodeURIComponent(error);
      }

      this.$store.dispatch('app/addNotification', {
        lifespan: 3000,
        data: {
          text,
        },
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

</style>
