<template>
  <pseudo-popup @close="closeHandler">
    <template #header>
      {{ texts.edit }}
    </template>

    <template
      #body
      class="lol"
    >
      <div
        v-if="me"
        class="edit-profile-page"
      >
        <div>
          <div class="user">
            <div class="user__input-wrapper">
              <ui-input
                v-model="profile.name"
                class="user__input"
                :placeholder="me.name"
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
            disabled
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
            disabled
            @click="_notImplemented"
          >
            Facebook
          </ui-button>
          <ui-button
            :type="3"
            :wide="true"
            class="login-button"
            disabled
            @click="_notImplemented"
          >
            Google
          </ui-button>
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
        class="l-mr-8"
        @click="submit"
      >
        {{ $t('workspace.editChannel.buttonSave') }}
      </ui-button>

      <ui-button
        :type="2"
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
    this.$set(this.profile, 'name', this.vuexName);
    this.$set(this.profile, 'avatar', this.vuexAvatar);
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
