<template>
<div
  class="avatar"
  :style="containerSize"
>
    <div class="avatar__image" :style="avatarImage"></div>

    <div v-if="statusStyle" class="avatar__status">
        <div :style="statusStyle" class="avatar__status__dot"></div>
    </div>

    <div v-if="onair" class="avatar__onair"></div>
</div>
</template>

<script>

/**
 * status-to-color map (small circle in bottom right corner)
 */
const STATUS_COLORS = {
  online: {
    'background-color': 'var(--color-1)',
    'border-color': 'var(--color-1)',
  },
  idle: {
    'background-color': 'var(--color-3)',
    'border-color': 'var(--color-3)',
  },
  offline: {
    'background-color': 'transparent',
    'border-color': 'var(--color-4)',
  },
};

export default {

  props: {

    /**
     * Image size
     */
    size: {
      type: [ Number ],
      default: 24,
    },

    /**
     * Image url
     */
    image: {
      type: [ String ],
      default: 'https://leonardo.osnova.io/51cf1edf-2288-5e45-f473-78568fa53fa8/', // TODO: remove after img upload is set up
    },

    /**
     * online status (small circle in bottom right corner)
     */
    status: {
      type: [ String ],
      default: null,
    },

    /**
     * If person is talking, we need to draw green circle around avatar.
     */
    onair: {
      type: [ Boolean ],
      default: false,
    },
  },

  computed: {

    /**
     * Set img as bg-image in css
     * @returns {Object} corresponding background-image
     */
    avatarImage() {
      if (this.image) {
        return {
          'background-image': `url("${this.$options.filters.formImageUrl(this.image, this.size)}")`,
        };
      }

      return {};
    },

    /**
     * Set img size in css
     * @returns {Object} height and width
     */
    containerSize() {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
      };
    },

    /**
     * Set status-circle color
     * @returns {Object} background-color and border-color
     */
    statusStyle() {
      return STATUS_COLORS[this.status] || null;
    },
  },

};
</script>

<style lang="stylus" scoped>
    .avatar
        position relative

        &__image
            width 100%
            height 100%
            background-color var(--text-0)
            background-position center
            background-size cover
            background-repeat no-repeat
            border-radius 50%

        &__status
            position absolute
            bottom -2px
            right -2px
            width calc(100% * 1/3)
            height calc(100% * 1/3)
            min-width 4px
            min-height 4px
            max-width 12px
            max-height 12px
            border-radius 50%
            background-color var(--app-bg)
            border 2px solid var(--app-bg)

            &__dot
                position absolute
                box-sizing border-box
                bottom 0px
                right 0px
                width 100%
                height 100%
                border-radius 50%
                border: 2px solid

        &__onair
            position absolute
            bottom 0
            right 0
            left 0
            top 0
            border-radius 50%
            background-color transparent
            border 2px solid var(--color-1)

            &::after
                content ''
                position absolute
                bottom 0
                right 0
                left 0
                top 0
                border-radius 50%
                background-color transparent
                border 2px solid var(--app-bg)
</style>
