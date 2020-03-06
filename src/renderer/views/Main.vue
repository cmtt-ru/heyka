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
    ipcRenderer.send('StartChannel', 'Hello from Main!');
    ipcRenderer.on('deep-link', (event, args) => {
      this.message = args;
    });
    this.$i18n.locale = 'ru';

    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);
  },
};
</script>
