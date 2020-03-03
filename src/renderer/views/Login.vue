<template>
    <div>Login window</div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  mounted() {
    ipcRenderer.send('StartChannel', 'Hello from Login!');
  },
};
</script>

<style scoped lang="stylus">

</style>