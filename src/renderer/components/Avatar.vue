<template>
  <div
    class="avatar"
    :style="containerSize"
  >
    <img
      v-if="!loaded"
      class="avatar__no-image"
      src="@assets/apng/loader.png"
    >

    <img
      loading="lazy"
      class="avatar__image"
      :class="{'avatar__image--square': square}"
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
            color var(--shadow-50)

        &__image
            position relative
            display block
            width 100%
            height 100%
            border-radius 50%
            object-fit cover

            &--square
              border-radius 0

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
