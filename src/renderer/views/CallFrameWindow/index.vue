<template>
  <div class="frame" />
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Login!');
  },
};
</script>

<style scoped lang="stylus">
  .frame
    width 100vw
    height 100vh
    border 5px solid var(--color-3)
    box-sizing border-box
</style>
