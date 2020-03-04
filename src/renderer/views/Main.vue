<template>
    <div>Main window. {{$t("message")}}</div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  mounted() {
    ipcRenderer.send('StartChannel', 'Hello from Main!');
    const waitTime = 2000;

    setTimeout(() => {
      this.$root.$i18n.locale = 'ru';
    }, waitTime);
  },
};
</script>

<style scoped lang="stylus">

</style>
