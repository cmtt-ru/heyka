<template>
<div
  class="avatar"
  :style="containerSize"
>
    <img loading="lazy" class="avatar__image" alt="" :src="avatarImage"/>

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
      default: null,
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
        return this.$options.filters.formImageUrl(this.image, this.size); // TODO: поставить таймаут и перескачивание, если '429 Too many requests'
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
            display block
            width 100%
            height 100%
            background-image: url("data:image/svg+xml;utf8,<svg version='1.1' id='L9' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 100 100' enable-background='new 0 0 0 0' xml:space='preserve'> <path fill='rgba(0,0,0,0.5)' d='M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50'>       <animateTransform attributeName='transform' attributeType='XML' type='rotate' dur='1s' from='0 50 50' to='360 50 50' repeatCount='indefinite'/></path></svg>");
            background-repeat no-repeat
            background-size: 200%;
            background-position center
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
