<template>
  <div class="l-p-8">
    <br><br>
    <avatar :status="'online'" :onair="false"></avatar>
    <div>Main window. {{ $tc("message", seconds) }}</div>
    <br>
    <div>{{message}}</div>
    <br><br>
    <button @click="login()">Login</button>
    <br><br>
    <button @click="loadInitialState()">Load initial state</button>
    <br><br>

    <button @click="openPushWindow()">Открыть пуш</button>
    <button @click="closePushWindow()">Закрыть пуш</button>
    <br><br>
    <button @click="trayToggle()">Из трея/в трей</button>
    <br><br><br>

    <list :filterBy="''">
      <list-item @click.native="clickFirstElementHandler()" filterKey="Текст 1">
        <avatar @click.native.stop="clickFirstAvatarHandler()"></avatar>
        <div>Текст 1 очень очень длинный текст</div>
      </list-item>
      <list-item
        @click.native="clickChannelHandler(index)"
        v-for="(channel, index) in channels"
        :key="channel.name"
        :selected="channel.selected"
        :filterKey="channel.name"
        class="test-item"
        :class="{'test-item--selected': channel.selected}"
        button
      >
       <avatar></avatar>
       <div>{{channel.name}}</div>
      </list-item>
    </list>

    <br><br>

    <ui-button
      :type="7"
      size="small"
      height="16"
      icon="more"
      v-popover.click="{name: 'Some', options: {}}"
    />

    <ui-button
      class="l-ml-24"
      :type="7"
      size="small"
      height="16"
      icon="more"
      v-popover.hover="{name: 'Some', options: {}}"
    />

    <div
      style="width: 200px; height: 60px; background: #eee"
      v-popover.mouse.click="{name: 'Some', options: {}}"
    />

    <br>

    <div
      style="width: 200px; height: 60px; background: #eee"
      v-popover.mouse.right.click="{name: 'Some', options: {}}"
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
import UiButton from '@components/UiButton';
import { List, ListItem } from '@components/List';

let pushWindow;

export default {
  components: {
    Avatar,
    List,
    ListItem,
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

<style lang="stylus" scoped>
.test-item
  &:hover
    background-color var(--item-bg-hover)

  &--selected
    background-color var(--item-bg-multi-pick)
</style>
