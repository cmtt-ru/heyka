<template>
  <div class="l-p-8">
    <br><br>
    <div>Main window. {{ $tc("message", seconds) }}</div>
    <svg-icon name="headphones" size="24"></svg-icon>
    <br>
    <div>{{message}}</div>
    <br><br>
    <button @click="login()">Login</button>
    <br><br>
    <button @click="GetWorkspaces()">GetWorkspaces</button>
    <br><br>
    <button @click="openPushWindow()">Открыть пуш</button>
    <button @click="closePushWindow()">Закрыть пуш</button>
    <br><br><br>
    <button @click="trayToggle()">Из трея/в трей</button>
    <br><br><br>
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
    async login() {
      try {
        const res = await this.$API.auth.signinByLink(process.env.VUE_APP_LOGIN_BY_LINK);

        console.log(res);
      } catch (err) {
        console.log(err);
      }
    },
    async GetWorkspaces() {
      try {
        const res = await this.$API.workspace.getWorkspaces();

        console.log(res);
      } catch (err) {
        console.log(err);
      }
    },
    async openPushWindow() {
      // console.log(WindowManager.create);
      if (!pushWindow) {
        pushWindow = WindowManager.create({
          route: '/push-window',
          position: 'topRight',
          template: 'push',
          onClose: () => {
            pushWindow = null;
          },
        });
      }
    },
    closePushWindow() {
      if (pushWindow) {
        pushWindow.close();
        pushWindow = null;
      }
    },
    trayToggle() {
      ipcRenderer.send('tray-manager-toggle');
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
