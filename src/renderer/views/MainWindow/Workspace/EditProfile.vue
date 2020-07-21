<template>
  <div
    v-if="me"
    class="l-p-12"
  >
    <div class="close-strip">
      <ui-button
        :type="7"
        size="small"
        icon="close"
        @click="closeHandler"
      />
    </div>
    <div class="user">
      <ui-image
        v-model="profile.avatar"
        :size="40"
        @input="setNewImage"
      />
      <ui-input
        v-model="profile.name"
        class="user__name"
        :placeholder="me.name"
      />
    </div>

    <ui-button
      :type="5"
      @click="submitHandler"
    >
      Submit
    </ui-button>
  </div>
</template>

<script>
import { UiInput, UiImage } from '@components/Form';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
// import { ipcRenderer } from 'electron';
// import fs from 'fs';

export default {
  components: {
    UiInput,
    UiImage,
    UiButton,
  },

  data() {
    return {
      profile: {
        name: '',
        avatar: '',
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
      return this.$t('workspace.user');
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

    async submitHandler() {
      console.log(this.profile);
      await this.$API.user.editProfile(this.profile);
    },
  },

};
</script>

<style lang="stylus" scoped>

.close-strip
  height 40px
  width 40px
  margin-left auto
  box-sizing border-box
  padding 8px
  display flex
  flex-direction row
  justify-content flex-end

.user
  height 40px
  padding 0
  margin-bottom 24px
  width 100%
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__avatar
    flex-shrink 0
    flex-grow 0

  &__name
    margin-left 12px
    font-weight 500
    font-size 18px
    flex-shrink 1

  &__status
    right 0
    width 8px
    height 8px
    box-sizing border-box
    border-radius 50%
    border: 2px solid
    margin 2px 8px 0
    flex-shrink 0
    flex-grow 0

  &__more
    margin-left auto
    flex-shrink 0
    flex-grow 0
    margin-top -18px
    color var(--icon-1)

.user-action
  margin-bottom 8px

  &__inner
    display flex
    flex-direction row
    align-items center

    & div, svg
      flex-shrink 0

.icon-in-button
  margin 0 4px

.user-info
  margin-top 20px

  &__title
    font-size 12px
    color var(--text-1)

  &__content
    margin-top 4px

    &--email
      user-select all

</style>
