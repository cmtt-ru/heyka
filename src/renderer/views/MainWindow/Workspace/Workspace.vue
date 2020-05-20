<template>
  <div class="l-p-8">
    <br><br>

    <avatar
      :status="'online'"
      :onair="false"
    />
    <div>Main window. {{ $tc("message", seconds) }}</div>
    <br>
    <div>{{ message }}</div>
    <br><br>

    <button @click="openPushWindow()">
      Пригласить в канал
    </button>
    <button @click="openBusyWindow()">
      Я занят
    </button>
    <br><br>

    <br><br>
    <button @click="loadInitialState()">
      Load initial state
    </button>
    <button @click="login()">
      Login
    </button>
    <button @click="logout()">
      Logout
    </button>

    <br><br>

    <ui-button
      v-popover.click="{name: 'Workspace'}"
      :type="7"
      size="small"
      height="16"
      icon="more"
    />

    <ui-button
      v-popover.hover="{name: 'UserInChannel'}"
      class="l-ml-24"
      :type="7"
      size="small"
      height="16"
      icon="more"
    />

    <div
      v-popover.mouse.click="{name: 'UserInChannel', data: {userId: '123'}}"
      style="width: 200px; height: 60px; background: #eee"
    />

    <br>

    <div
      v-popover.mouse.right.click="{name: 'UserInChannel', options: {}}"
      style="width: 200px; height: 60px; background: #eee"
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
import Avatar from '@components/Avatar';
import logout from '@api/auth/logout';
import UiButton from '@components/UiButton';

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

  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Main!');
    const oneSecond = 1000;

    setInterval(() => {
      this.seconds += 1;
    }, oneSecond);
    this.message = this.$route.query.hash;
  },

  methods: {
    async login() {
      this.$router.replace({ name: 'auth' });
    },

    logout() {
      logout();
    },

    async openPushWindow() {
      this.$store.dispatch('app/addPush', {
        data: {
          user: this.$store.getters['me/getMyId'],
          channel: this.$store.getters['me/getSelectedChannelId'],
          buttons: [
            {
              text: 'Join',
              type: 1,
              action: this.alert,
            },
            {
              text: 'Busy',
              close: true,
              action: this.close,
            },
          ],
        },
      });
    },

    async openBusyWindow() {
      this.$store.dispatch('app/addPush', {
        data: {
          user: this.$store.getters['me/getMyId'],
          buttons: [
            {
              text: 'Close',
              close: true,
              action: this.close,
            },
          ],
        },
      });
    },

    alert() {
      console.log('Action');
    },

    close() {
      console.log('Cancel');
    },

    async loadInitialState() {
      await this.$store.dispatch('initial');
    },

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
