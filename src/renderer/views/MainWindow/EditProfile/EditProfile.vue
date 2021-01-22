<template>
  <pseudo-popup @close="closeHandler">
    <template #header>
      {{ texts.edit }}
    </template>

    <template #body>
      <div
        v-if="me"
        class="edit-profile-page"
      >
        <div>
          <div class="user">
            <ui-image
              :key="me.avatarFileId || me.id"
              :image="userAvatar(me.id, 64)"
              class="user__avatar"
              :size="64"
              @input="setNewAvatar"
            />
            <div class="edit-link edit-link--warning">
              Удалить фото
            </div>
          </div>

          <div class="block-title">
            Полное имя
          </div>
          <ui-input
            v-model="profile.name"
            class="user__input"
            :placeholder="me.name"
          />

          <div class="block-title">
            Почта
          </div>
          <div>
            {{ me.email }}
          </div>
          <div class="edit-link">
            Изменить почту
          </div>

          <div class="block-title">
            Пароль
          </div>
          <div
            class="edit-link"
            @click="resetHandler"
          >
            Сбросить пароль
          </div>

          <div class="link-social-accout">
            <div class="block-title">
              {{ texts.login }}
            </div>

            <ui-button
              :type="3"
              icon=""
              wide
              class="login-button"
              @click="socialHandler('slack')"
            >
              Slack
              <svg-icon
                v-if="socialAuth.slack"
                slot="right"
                color="var(--icon-1)"
                name="close"
                size="medium"
                @click.native.stop="detachSocialHandler('slack')"
              />
            </ui-button>

            <ui-button
              :type="3"
              icon=""
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
              :type="3"
              icon=""
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
        <div
          ref="savedText"
          class="saved-text"
        >
          {{ texts.saved }}
        </div>
      </div>
    </template>
    <template #footer>
      <ui-button
        :type="1"
        size="small"
        @click="submit"
      >
        {{ $t('workspace.editChannel.buttonSave') }}
      </ui-button>

      <ui-button
        :type="2"
        class="l-mr-6"
        size="small"
        @click="closeHandler"
      >
        {{ $t('workspace.editChannel.buttonCancel') }}
      </ui-button>
    </template>
  </pseudo-popup>
</template>

<script>
import PseudoPopup from '@components/PseudoPopup';
import { UiInput, UiImage } from '@components/Form';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';
import { WEB_URL } from '@sdk/Constants';

export default {
  components: {
    PseudoPopup,
    UiInput,
    UiImage,
    UiButton,
  },

  data() {
    return {
      profile: {
        name: null,
        avatarFileId: null,
      },
      socialName: null,
    };
  },

  computed: {
    ...mapGetters({
      selectedChannel: 'myChannel',
      me: 'myInfo',
      userAvatar: 'users/getUserAvatarUrl',
      socialAuth: 'me/getSocialAuth',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.userSettings');
    },

    /**
     * Our name from vuex
     * @returns {string}
     */
    vuexName() {
      return this.me.name;
    },

    /**
     * Our avatar from vuex
     * @returns {string}
     */
    vuexAvatarFileId() {
      return this.me.avatarFileId;
    },
  },

  watch: {
    vuexName(val) {
      this.$set(this.profile, 'name', val);
    },
    vuexAvatarFileId(val) {
      this.$set(this.profile, 'avatarFileId', val);
    },
  },

  mounted() {
    this.$set(this.profile, 'name', this.vuexName);
    this.$set(this.profile, 'avatarFileId', this.vuexAvatarFileId);

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
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.$router.back();
    },

    /**
     * update avatar with mew image file id
     * @param {string} fileId - new image file id from uploader
     * @returns {void}
     */
    setNewAvatar(fileId) {
      this.profile.avatarFileId = fileId;
    },

    /**
     * Update our info and send API
     * @returns {void}
     */
    async submit() {
      try {
        await this.$API.user.editProfile(this.profile);
        this.savedAnimation();
      } catch (err) {
        console.log(err);
      }
    },

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

    async resetHandler() {
      try {
        await this.$API.auth.discardPass({ email: this.me.email });
      } catch (err) {
        console.log('ERROR:', err);
      }

      const notification = {
        data: {
          text: this.$t['notifications.login.passReset'],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
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

.close-strip
  height 40px
  width 100%
  padding 0
  display flex
  flex-direction row
  justify-content space-between
  align-items center

.input-wrapper
  flex-grow 2

.user
  padding 0
  margin 0 0 12px 0
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__avatar
    margin 6px 14px 6px 0
    flex-shrink 0

.edit-link
  font-weight 500
  font-size 12px
  line-height 18px
  letter-spacing -0.24px
  color var(--new-UI-01)
  cursor pointer
  margin-top 8px

  &--warning
    color var(--new-signal-03)
    margin-top 0

.block-title
  margin 24px 0 8px
  font-weight bold
  font-size 14px
  line-height 24px
  color var(--new-UI-02)

.login-button
  margin-bottom 12px

.saved-text
  flex-grow 2
  display flex
  align-items flex-end
  width 100%
  box-sizing border-box
  bottom 0
  background-color var(--app-bg)
  opacity 0
  pointer-events none

  &--hiding
    animation $SAVE_FADE_TIME 1 forwards hideSaved

@keyframes hideSaved {
  0% {
    opacity: 0;
  }
  20%{
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }

}

</style>
