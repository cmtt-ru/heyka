<template>
    <div>Main window. {{ $tc("message", seconds) }}</div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  data() {
    return {
      seconds: 0,
    };
  },

  mounted() {
    ipcRenderer.send('StartChannel', 'Hello from Main!');

    this.$root.$i18n.locale = 'ru';

    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);
  },
};
</script>

<style scoped lang="stylus">

</style>
