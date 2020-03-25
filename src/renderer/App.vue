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
  @import './styles/fonts'
  @import './styles/global'
</style>
