<template>
  <div class="pseudo-popup">
    <div
      class="pseudo-popup__header"
      :class="{'pseudo-popup__header--with-shadow': headerShadow}"
    >
      <slot name="header" />
    </div>

    <div
      ref="body"
      class="pseudo-popup__body scroll"
    >
      <slot name="body" />
      <p
        v-for="(i, index) in test"
        :key="index"
      >
        {{ index }}
      </p>
    </div>

    <div
      class="pseudo-popup__footer"
      :class="{'pseudo-popup__footer--with-shadow': footerShadow}"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script>

// import { throttle } from 'throttle-debounce';

export default {
  props: {
    /**
     * Value in percent
     * min – 0
     * max – 100
     */
    value: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      test: new Array(parseInt('100')),
      headerShadow: false,
      footerShadow: false,
    };
  },

  mounted() {
    this.$refs.body.addEventListener('scroll', this.scrollHandler.bind(this));
    this.scrollHandler();
  },

  beforeDestroy() {
    this.$refs.body.removeEventListener('scroll', this.scrollHandler);
  },

  methods: {
    scrollHandler() {
      if (this.$refs.body.scrollHeight > this.$refs.body.clientHeight) {
        this.headerShadow = this.$refs.body.scrollTop > 0;
        this.footerShadow = this.$refs.body.clientHeight < this.$refs.body.scrollHeight - this.$refs.body.scrollTop;
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .pseudo-popup
    display flex
    flex-direction column
    height 100%

    &__header
      flex 0 0 40px
      line-height 40px
      font-size 14px
      font-weight 500
      background var(--app-bg)
      padding 0 12px
      transition box-shadow 0.15s ease

      &--with-shadow
        box-shadow 0 0 0 1px var(--line-stroke), 0 0 10px 0 rgba(0,0,0,0.25)

    &__body
      flex 1 1 auto
      padding 0 12px

    &__footer
      flex 0 0 56px
      background var(--app-bg)
      padding 12px
      box-sizing border-box
      transition box-shadow 0.15s ease

      &--with-shadow
        box-shadow 0 0 0 1px var(--line-stroke)

</style>
