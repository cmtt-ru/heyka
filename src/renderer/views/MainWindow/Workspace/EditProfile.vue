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
      <avatar
        :key="me.avatar"
        class="user__avatar"
        :image="avatar"
        :size="40"
        @click.native="storeImageFile"
      />
      <ui-input
        v-model="username"
        class="user__name"
        :placeholder="me.name"
      />
    </div>
    <input
      id="file"
      type="file"
      name="file"
      accept=".png, .jpg, .jpeg"
      @input="storeImageFile"
    >
    <img
      :src="newImage"
      width="30"
      height="30"
    >

    <ui-button
      :type="5"
      @click="submitHandler"
    >
      Submit
    </ui-button>
  </div>
</template>

<script>
import { UiInput } from '@components/Form';
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
// import { ipcRenderer } from 'electron';
// import fs from 'fs';

export default {
  components: {
    UiInput,
    Avatar,
    UiButton,
  },

  data() {
    return {
      newImage: '',
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

    username: {
      get() {
        this.$set(this.profile, 'name', this.me.name);

        return this.me.name;
      },
      set(val) {
        this.profile.name = val;
      },
    },

    avatar: {
      get() {
        this.$set(this.profile, 'avatar', this.me.avatar);

        return this.me.avatar;
      },
      set(val) {
        this.profile.avatar = val;
      },
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

    async storeImageFile(e) {
      console.log(e.target.files);
      const formData = new FormData();

      formData.append('image', e.target.files[0]);
      const result = await this.$API.user.image(formData);

      console.log(result);

      // const selectedFile = await ipcRenderer.invoke('remote-selectImage');

      // try {
      //   const fileBuffer = fs.readFileSync(selectedFile.uri);

      //   const formData = new FormData();

      //   const apiBlob = new Blob(Buffer.from(fileBuffer, 'binary'));

      //   formData.append('image', apiBlob, selectedFile.name);
      //   const result = await this.$API.user.image(formData);

      //   console.log(result);

      //   // convert image file to base64-encoded string

      //   const base64Image = Buffer.from(fileBuffer, 'binary').toString('base64');
      //   const imgSrcString = `data:image/${selectedFile.extension};base64,${base64Image}`;

      //   this.newImage = imgSrcString;
      // } catch (err) {
      //   console.log(err);
      // }
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
