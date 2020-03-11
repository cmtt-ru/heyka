<template>
    <div>
      <div>Main window. {{ $tc("message", seconds) }}</div>
      <svg-icon name="headphones" size="24"></svg-icon>
      <div>{{message}}</div>
    </div>

</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  data() {
    return {
      seconds: 0,
      message: '',
    };
  },

  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    this.$i18n.locale = 'ru';

    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);

    console.log('mainWindow:', this.$route.query);
    this.message = this.$route.query.hash;
  },
};
</script>
