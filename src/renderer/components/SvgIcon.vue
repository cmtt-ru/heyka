<template>
  <svg
    :class="classList"
    :height="dimension(height)"
    :width="dimension(width)"
    xmlns="http://www.w3.org/2000/svg">
    <title v-if="title">{{ title }}</title>
    <use
    :style="{strokeWidth: strokeWidth, opacity: opacity, stroke: strokeColor}"
    :xlink:href="iconPath"
    xmlns:xlink="http://www.w3.org/1999/xlink"/>
  </svg>
</template>

<script>
export default {
  name: 'svg-icon',
  data: function () {
    return {
      iconStrokes: {
        24: '1.2px',
        16: '1.2px',
        12: '1px',
      },
      defaultStroke: '1.2px',
    };
  },

  props: {
    width: {
      type: [Number, String],
      default: 16,
    },
    height: {
      type: [Number, String],
      default: 16,
    },
    size: {
      type: [Number, String],
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    opacity: {
      type: [Number, String],
      default: 1,
    },
    stroke: {
      type: [ String ],
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
  },

  computed: {

    strokeWidth() {
      if (Object.prototype.hasOwnProperty.call(this.iconStrokes, this.dimension(this.width))) {
        return this.iconStrokes[this.dimension(this.width)];
      } else {
        return this.defaultStroke;
      }
    },
    strokeColor() {
      if (this.stroke) {
        return this.stroke;
      } else {
        return 'inherit';
      }
    },

    iconPath() {
      let icon = require(`@assets/icons/${this.name}.svg`);

      if (Object.prototype.hasOwnProperty.call(icon, 'default')) {
        icon = icon.default;
      }

      return icon.url;
    },

    classList() {
      return 'icon icon--' + this.name;
    },

  },

  methods: {

    dimension(value) {
      if (this.size) {
        return Number(this.size);
      }

      return Number(value);
    },
  },

  mounted() {
    const time = 2000;

    // inner svg color change test
    setTimeout(() => {
      document.documentElement.style.setProperty('--secondary-stroke-svg', 'green');
    }, time);
  },
};
</script>

<style lang="stylus">
  :root
    --main-stroke-svg black
    --secondary-stroke-svg red

  .icon
    stroke var(--main-stroke-svg)
</style>
