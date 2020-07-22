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
        @input="setNewImage"
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

    name() {
      return this.me.name;
    },

    avatar() {
      return this.me.avatar;
    },
  },

  watch: {
    name(val) {
      this.$set(this.profile, 'name', val);
    },
    avatar(val) {
      this.$set(this.profile, 'avatar', val);
    },
  },

  mounted() {
    this.$set(this.profile, 'name', this.name);
    this.$set(this.profile, 'avatar', this.avatar);
  },

  beforeDestroy() {
    this.submit();
  },

  methods: {
    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.$router.back();
    },

    setNewImage(image) {
      this.profile.avatar = image;
    },

    /**
     * Throttle sending dots by sending them only every SEND_DELAY ms
     * @returns {void}
     */
    debounceSubmit: debounce(UPDATE_DELAY, false, function () {
      this.submit();
    }),

    async submit() {
      console.log(this.profile);
      await this.$API.user.editProfile(this.profile);
    },
  },

};
</script>

<style lang="stylus" scoped>
.edit-profile-page
  padding 0 12px 12px
  position relative

.close-strip
  height 40px
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
    border-radius 50%
    overflow hidden

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
    animation 2s 1 forwards hideSaved

@keyframes hideSaved {
  0% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }

}

</style>
