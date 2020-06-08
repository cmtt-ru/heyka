<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
require.context('@assets/icons', true, /[A-Za-z0-9-_,\s]+\.svg$/i);
export default {
  created() {
    this.loadSvgSprite();

    window.addEventListener('keypress', function (e) {
      if ((e.shiftKey && e.code == 'KeyI') || (e.ctrlKey && e.code == 'KeyI')) {
        WindowManager.getCurrentWindow().toggleConsole();
      } else if (e.ctrlKey && e.code == 'KeyR') {
        WindowManager.getCurrentWindow().reload();
      }
    }, true);
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
  @import './styles/fonts'
  @import './styles/global'
</style>
