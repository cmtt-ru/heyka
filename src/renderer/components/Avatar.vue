<template>
  <div
    class="avatar"
    :style="containerSize"
  >
    <div
      class="avatar__no-image"
      :class="{'avatar__image--square': square, 'avatar__image--round-corners': roundCorners}"
      :style="{'background-color': imageColor}"
    />

    <img
      v-if="image"
      loading="lazy"
      class="avatar__image"
      :class="{'avatar__image--square': square, 'avatar__image--round-corners': roundCorners}"
      alt=""
      :width="size"
      :height="size"
      :src="image"
      @load="loadHandler"
    >

    <div
      v-if="statusStyle"
      class="avatar__status"
    >
      <div
        :style="statusStyle"
        class="avatar__status__dot"
      />
    </div>

    <div
      v-if="onair && mic"
      class="avatar__onair"
    />
  </div>
</template>

<script>

const COLORS = [
  '#ff0074AA',
  '#EFCA08',
  '#EE7674',
  '#D33F49',
  '#845EC2',
  '#008E83',
  '#266DD3',
  '#C64191',
  '#B0A8B9',
  '#4FFBDF',
  '#4B4453', // used when no userId is provided
];

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
     * if true, image is not rounded
     */
    square: {
      type: [ Boolean ],
      default: false,
    },

    /**
     * Avatar with round corners
     */
    roundCorners: {
      type: [ Boolean ],
      default: false,
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

    /**
     * If person has mic on (in addition to onair)
     */
    mic: {
      type: [ Boolean ],
      default: true,
    },

    /**
     * ID of avatar's user
     */
    userId: {
      type: [ String ],
      default: null,
    },
  },
  data() {
    return {
      loaded: false,
    };
  },

  computed: {
    /**
     * Set img size in css
     * @returns {object} height and width
     */
    containerSize() {
      return {
        height: this.size + 'px',
        width: this.size + 'px',
      };
    },

    /**
     * Set status-circle color
     * @returns {object} background-color and border-color
     */
    statusStyle() {
      return STATUS_COLORS[this.status] || null;
    },

    imageColor() {
      if (this.userId === null) {
        return COLORS[10];
      }
      const firstDigit = this.userId.match(/\d/);

      return COLORS[firstDigit];
    },
  },

  methods: {

    loadHandler() {
      this.loaded = true;
      this.$emit('load');
    },
  },
};
</script>

<style lang="stylus" scoped>
    .avatar
        position relative

        &__no-image
            position absolute
            top 0
            left 0
            width 100%
            height 100%
            border-radius 50%

        &__image
            position relative
            display block
            width 100%
            height 100%
            border-radius 50%
            object-fit cover

            &--square
              border-radius 0

            &--round-corners
              border-radius 4px

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
                bottom 0
                right 0
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
