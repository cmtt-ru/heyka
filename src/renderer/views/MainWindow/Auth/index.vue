<template>
    <div>
    <div>Login wrapper</div>
    <router-view></router-view>
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

</style>