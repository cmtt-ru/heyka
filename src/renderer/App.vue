<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
require.context('@assets/icons', true, /[A-Za-z0-9-_,\s]+\.svg$/i);
export default {
  created() {
    this.loadSvgSprite();
  },

  methods: {
    loadSvgSprite() {
      const ajax = new XMLHttpRequest();

      ajax.open('GET', '/img/icons.svg', true);
      ajax.send();
      ajax.onload = function (e) {
        const div = document.createElement('div');

        div.style.pointerEvents = 'none';
        div.style.width = '1px';
        div.style.height = '1px';
        div.style.position = 'absolute';
        div.style.left = '-10px';
        div.innerHTML = ajax.responseText;
        document.body.insertBefore(div, document.body.childNodes[0]);
      };
    },
  },
};
</script>

<style lang="stylus">
  @import './styles/fonts'
  @import './styles/global'
</style>
