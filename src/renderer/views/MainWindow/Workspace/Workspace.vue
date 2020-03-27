<template>
  <div class="l-p-8">
    <br><br>
    <avatar :status="'online'" :onair="false"></avatar>
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

    <list>
      <list-item>
        <avatar slot="leftIcon" onair="true"></avatar>
        <div>Текст 1</div>
        </list-item>
      <list-item>Текст 2</list-item>
      <list-item>
        <div>Текст 3</div>
        <div slot="rightIcons">
          <svg-icon name="headphones" size="24"></svg-icon>
          <svg-icon name="headphones" size="24"></svg-icon>
        </div>
        </list-item>
      <list-item button>
        <svg-icon slot="leftIcon" name="headphones" size="24"></svg-icon>
        <div>Текст 4</div>
      </list-item>
      <list-item floatIcons>
        <div>Текст 5</div>
        <div slot="rightIcons">
          <svg-icon name="headphones" size="24"></svg-icon>
        </div>
      </list-item>
    </list>
  </div>

</template>

<script>
import { ipcRenderer } from 'electron';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import Avatar from '@components/Avatar';
import List from '@components/List';
import ListItem from '@components/ListItem';

let pushWindow;

export default {
  components: {
    Avatar,
    List,
    ListItem,
  },
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
