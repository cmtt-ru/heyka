<template>
  <div
    class="image"
  >
    <avatar
      class="user__avatar"
      :image="localImage"
      :size="size"
      square
      @load="tempSrc=null"
    />

    <div class="input-group">
      <label class="label">
        <svg-icon
          class="label__icon"
          name="attach"
          size="medium"
        />
        {{ $t('workspace.userSettings.upload') }}
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          @input="storeImageFile"
        >
      </label>
    </div>

    <img
      v-show="tempSrc"
      class="temp-image"
      alt=""
      :src="tempSrc"
      :width="size"
      :height="size"
    >
  </div>
</template>

<script>
import Avatar from '@components/Avatar';

const MAX_FILE_SIZE = 1048576;
const PRETTY_MAX_FILE_SIZE = '1Mb';

export default {
  components: {
    Avatar,
  },

  props: {
    /**
       * image url
       */
    image: {
      type: String,
      default: '',
    },

    /**
       * image size
       */
    size: {
      type: Number,
      default: 40,
    },

    /**
       * Make whole image inactive
       */
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      tempSrc: null,
      localImage: null,
    };
  },

  mounted() {
    this.localImage = this.image;
  },

  methods: {
    /**
       * Trigger after file was selected
       * @param {object} event - input event
       * @returns {void}
       */
    async storeImageFile(event) {
      if (event.target.files.length !== 1) {
        return;
      }
      if (event.target.files[0].size > MAX_FILE_SIZE) {
        this.tooBigImageAlert();

        return;
      }
      const formData = new FormData();

      formData.append('image', event.target.files[0]);

      try {
        this.localDisplayImage(event.target.files[0]);
        const result = await this.$API.user.image(formData);

        this.localImage = this.tempSrc;
        this.$emit('input', result.fileId);
      } catch (err) {
        this.tempSrc = null;
        console.log(err);
      }
    },

    /**
       * Show newly selected file locally - even before we uploaded it to servers
       * @param {File} file - image to display
       * @returns {void}
       */
    localDisplayImage(file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.tempSrc = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    /**
       * Show "file too big" notification if... file is too big
       * @returns {void}
       */
    async tooBigImageAlert() {
      const notification = {
        data: {
          lifespan: 5000,
          text: `${this.$t('workspace.userSettings.bigImage')} ${PRETTY_MAX_FILE_SIZE}`,
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },
  },

};
</script>

<style lang="stylus" scoped>
  .image
    position relative
    flex-shrink 0
    border-radius 50%
    overflow hidden

    & .input-group
      position absolute
      width 100%
      height 100%
      top 0
      left 0

      & .label
        width 100%
        height 100%
        display flex
        flex-direction column
        justify-content center
        align-items center
        cursor pointer
        background-color rgba(0, 0, 0, 0.5)
        color white
        font-size 12px
        opacity 0
        border-radius 50%
        transition 0.2s opacity ease

        &:hover
          opacity 1

        &__icon
          margin-top -4px

  .temp-image
    position absolute
    top 0
    left 0
    object-fit cover
    background-color var(--app-bg)
    filter grayscale(100%) blur(2px)

  input
    pointer-events none
    user-select none
    outline 0
    opacity 0
    width 0
    height 0

</style>
