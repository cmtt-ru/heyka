<template>
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
        <div
          class="edit-link edit-link--warning"
          @click="_notImplemented()"
        >
          {{ texts.deletePhoto }}
        </div>
      </div>

      <div class="block-title">
        {{ texts.fullNameLabel }}
      </div>
      <ui-input
        v-model="profile.name"
        class="user__input"
        :placeholder="me.name"
      />

      <div class="block-title">
        {{ texts.emailLabel }}
      </div>
      <div>
        {{ me.email }}
      </div>
      <div
        class="edit-link"
        @click="_notImplemented()"
      >
        {{ texts.editEmail }}
      </div>

      <div class="block-title">
        {{ texts.passLabel }}
      </div>
      <div
        class="edit-link"
        @click="resetHandler"
      >
        {{ texts.resetPass }}
      </div>
    </div>
    <div
      ref="savedText"
      class="saved-text"
    >
      {{ texts.saved }}
    </div>
    <ui-button
      :type="1"
      size="small"
      @click="submit"
    >
      {{ $t('workspace.editChannel.buttonSave') }}
    </ui-button>
  </div>
</template>

<script>
import { UiInput, UiImage } from '@components/Form';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import { WEB_URL } from '@sdk/Constants';

export default {
  components: {
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
          text: this.$t('notifications.login.passReset'),
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
  padding 6px 8px

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