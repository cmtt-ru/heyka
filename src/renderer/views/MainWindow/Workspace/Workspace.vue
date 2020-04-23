<template>
  <div class="l-p-8">
    <br><br>
    <avatar :status="'online'" :onair="false"></avatar>
    <div>Main window. {{ $tc("message", seconds) }}</div>
    <br>
    <div>{{message}}</div>
    <br><br>
    <button @click="login()">Login (by link in .ENV)</button>
    <br><br>

    <button @click="openPushWindow()">Открыть пуш</button>
    <button @click="closePushWindow()">Закрыть пуш</button>
    <br><br>
  </div>

</template>

<script>
import { ipcRenderer } from 'electron';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import Avatar from '@components/Avatar';

let pushWindow;

export default {
  components: {
    Avatar,
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
    /**
     * Detect Avatar (part of list-item) click
     * @returns {void}
     */
    clickFirstAvatarHandler() {
      console.log('нажали на аватарку');
    },
    /**
     * Detect list-item click
     * @returns {void}
     */
    clickFirstElementHandler() {
      console.log('нажали на элемент');
    },
    /**
     * Multi-pick testing
     * @param {number} index index of clicked channel
     * @returns {void}
     */
    clickChannelHandler(index) {
      this.$set(this.channels[index], 'selected', !this.channels[index].selected);
    },
    async login() {
      try {
        const res = await this.$API.auth.signinByLink(process.env.VUE_APP_LOGIN_BY_LINK);

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
