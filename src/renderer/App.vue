<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import themes from '@/themes/themes.json';

export default {
  data() {
    return {
      themeArray: themes.themeColors,
      currentColor: 0,
    };
  },
  methods: {
    switchColors() {
      for (const prop in this.themeArray[this.currentColor]) { // задаём глобальные переменные css
        document.documentElement.style.setProperty('--' + prop, this.themeArray[this.currentColor][prop]);
      }
    },
  },
  created() {
    this.switchColors();

    ipcRenderer.on('theme-dark', (event, arg) => {
      console.log(arg);
      this.currentColor = 1;
      this.switchColors();
    });
  },
};
</script>

<style lang="stylus">
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color var(--main)
  margin-top 60px
  background-color var(--secondary)
</style>
