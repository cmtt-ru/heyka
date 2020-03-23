<template>
    <div>
    <div>Push Wrapper</div>
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
    #app
        background-color var(--main)
        color var(--secondary)
</style>