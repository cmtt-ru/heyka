<template>
  <svg :class="className" xmlns="http://www.w3.org/2000/svg">
    <title v-if="title">{{ title }}</title>
    <use :xlink:href="iconPath" xmlns:xlink="http://www.w3.org/1999/xlink"/>
  </svg>
</template>

<script>
export default {
  name: 'svg-icon',

  props: {
    name: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: null,
    },
  },

  computed: {
    iconPath() {
      let icon = require(`@assets/icons/${this.name}.svg`);

      if (Object.prototype.hasOwnProperty.call(icon, 'default')) {
        icon = icon.default;
      }

      return icon.url;
    },

    className() {
      return 'svg-icon svg-icon--' + this.name;
    },
  },
  mounted() {
    const time = 2000;

    setTimeout(() => {
      document.documentElement.style.setProperty('--stroke-color', 'green');
    }, time);
  },
};
</script>

<style>
:root {
  --stroke-color: red;
}
  .svg-icon {
    height: 24px;
    width: 24px;
  }

</style>
