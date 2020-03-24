<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  created() {
    ipcRenderer.on('theme-dark', (event, arg) => {
      this.$themes.userHasDarkPreference();
      // console.log(this.$themes.getThemes());
    });
  },
};
</script>

<style lang="stylus">
*
  margin 0
  padding 0

#app
  font-family Avenir, Helvetica, Arial, sans-serif
  color var(--main)
  background-color var(--secondary)
</style>
