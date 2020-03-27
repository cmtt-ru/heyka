<template>
<div class="avatar" :style="containerSize">
    <div class="avatar__image" :style="avatarImage"></div>
    <div v-if="statusStyle" class="avatar__status">
        <div :style="statusStyle" class="avatar__status__dot"></div>
    </div>
    <div v-if="onair" class="avatar__onair"></div>
</div>
</template>

<script>
import leonardo from '@/filters/leonardo';
export default {
  data: function () {
    return {
      statusColors: {
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
      },
    };
  },

  props: {
    size: {
      type: [ Number ],
      default: 24,
    },
    image: {
      type: [ String ],
      default: 'https://leonardo.osnova.io/51cf1edf-2288-5e45-f473-78568fa53fa8/',
    },
    status: {
      type: [ String ],
      default: null,
    },
    onair: {
      type: [ Boolean ],
      default: false,
    },
  },

  computed: {
    avatarImage() {
      if (this.image) {
        return {
          'background-image': `url("${leonardo(this.image, this.size)}")`,
        };
      }

      return {};
    },
    containerSize() {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
      };
    },
    statusStyle() {
      return this.statusColors[this.status] || null;
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
            background-color red
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
