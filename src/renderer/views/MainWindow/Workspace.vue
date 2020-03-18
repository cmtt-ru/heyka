<template>
    <div>
      <div>Main window. {{ $tc("message", seconds) }}</div>
      <svg-icon name="headphones" size="24"></svg-icon>
      <div>{{message}}</div>
      <button @click="openPushWindow()">Открыть пуш</button>
      <button @click="closePushWindow()">Закрыть пуш</button>
    </div>

</template>

<script>
import { ipcRenderer } from 'electron';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

let pushWindow;

export default {
  data() {
    return {
      seconds: 0,
      message: '',
      input: '',

    };
  },

  methods: {
    async openPushWindow() {
      // console.log(WindowManager.create);
      if (!pushWindow) {
        pushWindow = WindowManager.create({
          route: '/push-window',
          position: 'trayCenter',
          template: 'push',
          onClose: () => {
            pushWindow = null;
          },
        });
      }
    },
    closePushWindow(event, visible) {
      if (pushWindow) {
        pushWindow.close();
        pushWindow = null;
      }
    },
  },

  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    this.$i18n.locale = 'ru';

    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);

    // console.log('mainWindow:', this.$route.query);
    this.message = this.$route.query.hash;
  },
};
</script>
