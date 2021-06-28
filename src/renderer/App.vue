<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import '@sdk/styles/fonts.styl';
import '@styles/global.styl';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import Mousetrap from 'mousetrap';
import broadcastEvents from '@sdk/classes/broadcastEvents';

import themes from '@sdk/themes';
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

    Mousetrap.bind('esc esc esc', function () {
      broadcastEvents.dispatch('go-to-support');
    });

    Mousetrap.bind('up up down down left right left right', function () {
      themes.manualSetTheme('light');
    });

    /**
     * Listener for context menu
     */
    document.body.addEventListener('contextmenu', ({ target }) => {
      const windowId = WindowManager.getCurrentWindowId();
      let node = target;

      while (node) {
        if (node.hasAttribute && node.hasAttribute('context-menu')) {
          window.ipcRenderer.invoke('open-input-context-menu', windowId);
          break;
        }
        node = node.parentNode;
      }
    });

    window.addEventListener('mouseup', function (e) {
      const SIDE_MOUSE_BUTTON_1 = 3;
      const SIDE_MOUSE_BUTTON_2 = 4;

      if (e.button === SIDE_MOUSE_BUTTON_1 || e.button === SIDE_MOUSE_BUTTON_2) {
        e.preventDefault();
      }
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
