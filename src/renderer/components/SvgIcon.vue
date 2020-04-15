<template>
  <svg
    :class="classList"
    :height="dimension(height)"
    :width="dimension(width)"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title v-if="title">{{ title }}</title>

    <use
    v-if="!animate"
    :style="{strokeWidth, stroke}"
    :xlink:href="iconPath"
    xmlns:xlink="http://www.w3.org/1999/xlink"/>

    <g v-if="animate" :style="{strokeWidth, stroke}">
      <slot></slot>
    </g>

  </svg>
</template>

<script>

/**
 * Icon stroke depending on icon size
 */
const ICON_STROKES = {
  24: '1.2px',
  16: '1.2px',
  12: '1px',
  default: '1.2px',
};

/**
 * Icon dimensions
 */
const ICON_SIZES = {
  small: 12,
  medium: 16,
  large: 24,
};

export default {
  name: 'svg-icon',

  props: {

    /**
     * Icon name. Used for import from svg-sprite
     */
    name: {
      type: String,
      required: true,
    },

    /**
     * Icon width
     */
    width: {
      type: [Number, String],
      default: 16,
    },

    /**
     * Icon height
     */
    height: {
      type: [Number, String],
      default: 16,
    },

    /**
     * Icon width AND height. More important than separate width/height props. Passed as keyword: small/medium/large
     */
    size: {
      type: [ String ],
      default: null,
    },

    /**
     * Icon stroke color. Hex, rgba or none (default to 'inherit')
     */
    stroke: {
      type: [ String ],
      default: 'currentColor',
    },

    /**
     * Defines if icon is moving or not. If it is moving, it should NOT be included in svg-sprite (because of animation issues), but passed as a vue component in default slot. Animated icons are stored at /assets/icons/iconsAnimate
     */
    animate: {
      type: Boolean,
      default: false,
    },

    /**
     * Icon title. For now it's just tooltip helper
     */
    title: {
      type: String,
      default: null,
    },

    /**
     * ?Icon opacity. Probably not needed
     */
    opacity: {
      type: [Number, String],
      default: 1,
    },
  },

  computed: {

    /**
     * Set stroke width depending on icon width
     * @returns {string} stroke width
     */
    strokeWidth() {
      if ({}.hasOwnProperty.call(ICON_STROKES, this.dimension(this.width))) {
        return ICON_STROKES[this.dimension(this.width)];
      } else {
        return ICON_STROKES.default;
      }
    },

    /**
     * Import icon from svg-sprite
     * @returns {string} icon url
     */
    iconPath() {
      let icon = require(`@assets/icons/${this.name}.svg`);

      if (Object.prototype.hasOwnProperty.call(icon, 'default')) {
        icon = icon.default;
      }

      return icon.url;
    },

    /**
     * Attach additional classes to icon elements for possible future styling
     * @returns {string} 'icon' and 'icon-#icon_name#' as classes
     */
    classList() {
      return 'icon icon--' + this.name;
    },

  },

  methods: {

    /**
     * Return width/height in px if "size" prop is defined. Otherwise set width/height as passed in props "width/height"
     * @param {string} value width/height in px
     * @returns {number} correct width/height in px
     */
    dimension(value) {
      if (this.size) {
        return ICON_SIZES[this.size];
      }

      return Number(value);
    },
  },
};
</script>
