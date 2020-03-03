<template>
    <div>
        <div>Main window</div>
        <SvgIcon name="headphones"></SvgIcon>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  mounted() {
    ipcRenderer.send('StartChannel', 'Hello from Main!');
  },
};
</script>

<style scoped lang="stylus">

</style>
