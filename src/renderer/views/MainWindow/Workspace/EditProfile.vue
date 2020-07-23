<template>
  <div
    v-if="me"
    class="edit-profile-page"
  >
    <div class="close-strip">
      <div>{{ texts.edit }}</div>
      <ui-button
        :type="7"
        size="small"
        icon="close"
        @click="closeHandler"
      />
    </div>
    <div class="user">
      <div class="user__input-wrapper">
        <ui-input
          v-model="profile.name"
          class="user__input"
          :placeholder="me.name"
          @input="debounceSubmit"
        />
        <ui-input
          v-model="me.email"
          class="user__input"
          disabled
        />
      </div>

      <ui-image
        v-model="profile.avatar"
        class="user__avatar"
        :size="76"
        @input="setNewAvatar"
      />
    </div>

    <div class="login-label">
      {{ texts.login }}
    </div>

    <ui-button
      :type="6"
      icon=""
      wide
      class="login-button"
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
      :wide="true"
      class="login-button"
      @click="_notImplemented"
    >
      Facebook
    </ui-button>
    <ui-button
      :type="3"
      :wide="true"
      class="login-button"
      @click="_notImplemented"
    >
      Google
    </ui-button>
    <div
      ref="savedText"
      class="saved-text"
    >
      {{ texts.saved }}
    </div>
  </div>
</template>

<script>
import { UiInput, UiImage } from '@components/Form';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import { debounce } from 'throttle-debounce';

const UPDATE_DELAY = 1000;

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
        avatar: null,
      },
    };
  },

  computed: {
    ...mapGetters({
      selectedChannel: 'myChannel',
      me: 'myInfo',
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
    vuexAvatar() {
      return this.me.avatar;
    },
  },

  watch: {
    vuexName(val) {
      this.$set(this.profile, 'name', val);
    },
    vuexAvatar(val) {
      this.$set(this.profile, 'avatar', val);
    },
  },

  mounted() {
    this.$set(this.profile, 'name', this.name);
    this.$set(this.profile, 'avatar', this.avatar);
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
     * update avatar with mew image
     * @param {string} image - new image link from uploader
     * @returns {void}
     */
    setNewAvatar(image) {
      this.profile.avatar = image;
      this.submit();
    },

    /**
     * Debounce updating our info and sending API
     * @returns {void}
     */
    debounceSubmit: debounce(UPDATE_DELAY, false, function () {
      this.submit();
    }),

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

      if (!text) {
        return;
      }
      text.classList.add('saved-text--hiding');
      const hideTime = 2000;

      setTimeout(() => {
        text.classList.remove('saved-text--hiding');
      }, hideTime);
    },
  },

};
</script>

$SAVE_FADE_TIME = 2s

<style lang="stylus" scoped>
.edit-profile-page
  padding 0 12px 12px
  position relative

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
  margin 10px 0 12px
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__input-wrapper
    flex-grow 1

  &__input
    margin 6px 0

  &__input:first-of-type
    margin-bottom 12px

  &__avatar
    margin 6px 0 6px 12px
    flex-shrink 0

.login-label
  font-size 12px
  line-height 18px
  padding 8px 0

.login-button
  margin-bottom 12px

.saved-text
  position fixed
  width 100%
  box-sizing border-box
  padding 8px
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
