<template>
  <div
    class="image"
  >
    <avatar
      class="user__avatar"
      :image="localImage"
      :size="size"
      square
    />

    <div class="input-group">
      <label class="label">
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

export default {
  components: {
    Avatar,
  },

  props: {
    /**
     * image url
     */
    value: {
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
    };
  },

  computed: {
    /**
     * Local copy of image url
     * @returns {string} value
     */
    localImage: {
      get() {
        return this.value;
      },
      set(image) {
        this.$emit('input', image);
        const smallFadeOut = 50;

        setTimeout(() => {
          this.tempSrc = null;
        }, smallFadeOut);
      },
    },
  },

  methods: {
    /**
     * Trigger after file was selected
     * @param {object} event - input event
     * @returns {void}
     */
    async storeImageFile(event) {
      if (event.target.files.length === 0) {
        return;
      }
      const formData = new FormData();

      formData.append('image', event.target.files[0]);
      try {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.tempSrc = e.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);

        const result = await this.$API.user.image(formData);

        this.localImage = result.image;
      } catch (err) {
        console.log(err);
      }
    },
  },

};
</script>

<style lang="stylus" scoped>
.image
  position relative
  flex-shrink 0

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
      background-color rgba(0,0,0,0.5)
      color white
      opacity 0
      transition 0.2s opacity ease

      &:hover
        opacity 1

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
