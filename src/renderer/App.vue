<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {

  methods: {

  },
  created() {
    ipcRenderer.on('theme-dark', (event, arg) => {
      this.$themes.switchTheme('dark');
      console.log(this.$themes.getThemes());
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
