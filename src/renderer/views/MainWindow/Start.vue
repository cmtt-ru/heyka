<template>
    <div>start</div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  created() {
    ipcRenderer.send('start-is-ready');
    ipcRenderer.on('default-behaviour', (event, arg) => {
      this.$router.replace('main');
    });
  },
};
</script>