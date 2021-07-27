<template>
  <div
    v-if="me || me.user"
    class="edit-profile-page"
  >
    <div class="user">
      <ui-image
        ref="avatarInput"
        :image="userAvatar(me.user.id, 64)"
        :big-image="userAvatar(me.user.id, Infinity)"
        class="user__avatar"
        :size="64"
        @input="setNewAvatar"
        @delete-image="deleteImage"
      />
    </div>

    <ui-form
      @submit="submit"
    >
      <div class="block-title">
        {{ texts.fullNameLabel }}
      </div>

      <ui-input
        v-model="profile.name"
        class="user__input"
        :minlength="3"
        required
        :placeholder="vuexName"
      />

      <div v-if="me.user.email">
        <div class="block-title">
          {{ texts.emailLabel }}
        </div>
        <div>
          {{ me.user.email }}
        </div>
        <div
          class="edit-link"
          @click="editEmail"
        >
          {{ texts.editEmail }}
        </div>
      </div>

      <div v-if="me.user.email">
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

      <ui-button
        v-if="!saved"
        :type="1"
        size="large"
        class="l-mt-24"
        wide
        submit
      >
        {{ $t('workspace.editChannel.buttonSave') }}
      </ui-button>
      <ui-button
        v-else
        :type="5"
        wide
        class="l-mt-24"
        submit
      >
        {{ $t('techTexts.saved') }}
      </ui-button>
    </ui-form>
  </div>
</template>

<script>
import { UiForm, UiInput, UiImage } from '@components/Form';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import { WEB_URL } from '@sdk/Constants';
import notify from '@libs/notify';

export default {
  components: {
    UiForm,
    UiInput,
    UiImage,
    UiButton,
  },

  data() {
    return {
      socialName: null,
      profile: {
        name: null,
        avatarFileId: null,
      },
      saved: false,
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
      return this.me?.user?.name;
    },

    /**
     * Our avatar from vuex
     * @returns {string}
     */
    vuexAvatarFileId() {
      return this.me?.user?.avatarFileId;
    },

    localAvatarId() {
      return this.profile.avatarFileId;
    },
  },

  watch: {
    vuexName(val) {
      console.log(val);
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
      this.__backOrRedirect();
    },

    selectAvatar() {
      this.$refs.avatarInput.clickInput();
    },

    /**
     * update avatar with mew image file id
     * @param {string} fileId - new image file id from uploader
     * @returns {void}
     */
    setNewAvatar(fileId) {
      this.$set(this.profile, 'avatarFileId', fileId);
      this.submit();
    },

    /**
     * Update our info and send API
     *
     * @param {boolean} animation - true if we need to show "saved!" text
     * @returns {void}
     */
    async submit(animation = true) {
      try {
        await this.$API.user.editProfile(this.profile);
        if (animation) {
          this.savedAnimation();
        }
      } catch (err) {
        console.log(err);
      }
    },

    async deleteImage() {
      this.$refs.avatarInput.clearInput();

      try {
        this.$set(this.profile, 'avatarFileId', null);
        await this.$API.user.editProfile({ avatarFileId: null });
        this.savedAnimation();
      } catch (err) {
        console.log(err);
      }
    },

    /**
     * show "saved!" button after successful API request
     * @returns {void}
     */
    savedAnimation() {
      this.saved = true;
      const time = 5000;

      setTimeout(() => {
        this.saved = false;
      }, time);
    },

    async resetHandler() {
      try {
        await this.$API.auth.discardPass({ email: this.me.user.email });
      } catch (err) {
        console.log('ERROR:', err);
      }

      notify('notifications.login.passReset');
    },

    /**
     * Open manage workspace
     * @returns {void}
     */
    async editEmail() {
      const { code } = await this.$API.auth.link();
      const link = `${WEB_URL}/auth/email/change/${code}`;

      if (IS_DEV) {
        navigator.clipboard.writeText(link);
      }
      window.open(link);
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

.edit-link
  font-weight 500
  font-size 12px
  line-height 18px
  letter-spacing -0.24px
  color var(--UI-active)
  cursor pointer
  margin-top 8px

  &--warning
    color var(--UI-error)

.user
  padding 0
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__avatar
    margin-right 14px
    flex-shrink 0

  & .edit-link
    margin-top 0

.block-title
  margin 24px 0 8px
  font-weight bold
  line-height 24px
  color var(--Text-primary)

.login-button
  margin-bottom 12px

.saved-text
  flex-grow 2
  display flex
  align-items flex-end
  width 100%
  box-sizing border-box
  bottom 0
  background var(--Background-white)
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
