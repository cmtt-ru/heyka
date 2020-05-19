<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <router-view />
  </div>
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
    .layout__popover
        width 100vw
        height 100vh
        -webkit-app-region drag
        background-color var(--app-bg)
        color var(--text-0)
</style>
