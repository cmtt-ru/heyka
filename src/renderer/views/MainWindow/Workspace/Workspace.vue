<template>
  <div class="l-p-8">
    <br><br>
    <avatar :status="'online'" :onair="false"></avatar>
    <div>Main window. {{ $tc("message", seconds) }}</div>
    <br>
    <div>{{message}}</div>
    <br><br>

    <button @click="openPushWindow()">Открыть пуш</button>
    <button @click="closePushWindow()">Закрыть пуш</button>
    <br><br>

    <button @click="openCallWindow">Открыть окно звонка</button>
    <button @click="closeCallWindow">Закрыть</button>
    <br><br>

    <br>
    <button @click="loadInitialState()">Load initial state</button>
    <button @click="login()">Login</button>
    <button @click="logout()">Logout</button>

    <br><br>

    <ui-button
      :type="7"
      size="small"
      height="16"
      icon="more"
      v-popover.click="{name: 'Workspace'}"
    />

    <ui-button
      class="l-ml-24"
      :type="7"
      size="small"
      height="16"
      icon="more"
      v-popover.hover="{name: 'UserInChannel'}"
    />

    <div
      style="width: 200px; height: 60px; background: #eee"
      v-popover.mouse.click="{name: 'UserInChannel', data: {userId: '123'}}"
    />

    <br>

    <div
      style="width: 200px; height: 60px; background: #eee"
      v-popover.mouse.right.click="{name: 'UserInChannel', options: {}}"
    />

    <br><br>
    <br><br>
    <br><br>
    <br><br>
    <br><br>
    <br><br>
    <p>the end</p>
  </div>

</template>

<script>
import { ipcRenderer } from 'electron';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import Avatar from '@components/Avatar';
import logout from '@api/auth/logout';
import UiButton from '@components/UiButton';

let pushWindow;
let callWindow;

export default {
  components: {
    Avatar,
    UiButton,
  },
  data() {
    return {
      seconds: 0,
      message: '',
      channels: [
        { name: '123' },
        { name: '456' },
        { name: '789' },
      ],

    };
  },

  methods: {
    async login() {
      this.$router.replace({ name: 'auth' });
    },

    logout() {
      logout();
    },

    async openPushWindow() {
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

    openCallWindow() {
      if (!callWindow) {
        callWindow = WindowManager.create({
          route: '/call-window',
          position: 'center',
          template: 'call',
          alwaysOnTop: true,
          onClose: () => {
            callWindow = null;
          },
        });
      }
    },

    closeCallWindow() {
      if (callWindow) {
        callWindow.close();
        callWindow = null;
      }
    },

    async loadInitialState() {
      await this.$store.dispatch('initial');
    },

  },

  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);
    this.message = this.$route.query.hash;
  },
};
</script>

<style lang="stylus" scoped>
.test-item
  &:hover
    background-color var(--item-bg-hover)

  &--selected
    background-color var(--item-bg-multi-pick)
</style>
