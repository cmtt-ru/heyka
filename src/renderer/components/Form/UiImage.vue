<template>
  <div
    class="image"
  >
    <avatar
      class="user__avatar"
      :image="localImage"
      :size="size"
    />

    <img
      class="input-group"
      alt=""
      :src="tempSrc"
    >

    <div class="input-group">
      <label class="label">
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          @input="storeImageFile"
        >
      </label>
    </div>
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
      tempSrc: '',
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
        this.tempSrc = '';
        this.$emit('input', image);
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
      this.localImage = '';
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
    border-radius 50%

    & .label
      width 100%
      height 100%
      display block
      cursor pointer

input
  pointer-events none
  user-select none
  outline 0
  opacity 0

</style>
