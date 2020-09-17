<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import Mousetrap from 'mousetrap';
require.context('@assets/icons', true, /[A-Za-z0-9-_,\s]+\.svg$/i);

export default {
  created() {
    this.loadSvgSprite();

    Mousetrap.bind(['command+i', 'ctrl+i'], () => {
      WindowManager.getCurrentWindow().action('console');
    });
    Mousetrap.bind(['command+r', 'ctrl+r'], () => {
      WindowManager.getCurrentWindow().action('reload');
    });
    Mousetrap.bind('up up down down left right left right b a enter', function () {
      console.log('%ckonami code!', 'color: green; font: 4rem/1 Tahoma;');
    });
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
        div.style.overflow = 'hidden';
        div.innerHTML = ajax.responseText;
        document.body.insertBefore(div, document.body.childNodes[0]);
      };
    },
  },
};
</script>

<style lang="stylus">
  @import '../sdk/styles/fonts'
  @import '../sdk/styles/global'
</style>
