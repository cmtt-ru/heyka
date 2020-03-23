<template>
    <div>
      <div>Main window. {{ $tc("message", seconds) }}</div>
      <svg-icon name="headphones" size="24"></svg-icon>
      <div>{{message}}</div>
      <br><br>
      <button @click="Login()">Login</button>
      <br><br>
      <button @click="GetWorkspaces()">GetWorkspaces</button>
    </div>

</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      seconds: 0,
      message: '',
      input: '',
    };
  },

  methods: {
    Login() {
      this.$API.auth.signinByLink('7a514d3b0f3d44d09d05564ca12a049200c8c576908cd0fe2065105cab4ca7e99613b72b3094303eb3').then((res) => {
        console.log(res);
      })
        .catch((err) => {
          console.log(err);
        });
    },
    GetWorkspaces() {
      this.$API.workspace.getWorkspaces().then((res) => {
        console.log(res);
      })
        .catch((err) => {
          console.log(err);
        });
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
