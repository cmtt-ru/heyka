<template>
  <div>
    <janus />
    <notifications />
    <router-view />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import DeepLinkRenderer from '@shared/DeepLink/DeepLinkRenderer';
import Janus from '@components/Janus.vue';

import Notifications from '@components/Notifications';

export default {
  components: {
    Janus,
    Notifications,
  },
  data() {
    return {
      deepLink: {},
    };
  },

  async created() {
    try {
      await this.$API.auth.check();

      ipcRenderer.send('start-is-ready');

      this.deepLink = new DeepLinkRenderer({
        invite: 'main-window/signinbylink',
        login: 'main-window/login',
        join: 'main-window/workspace',
        call: 'main-window/workspace',
        d: 'main-window/workspace',
      });

      await this.$store.dispatch('initial');
    } catch (e) {
      console.log('redirecting to login');
    }

    ipcRenderer.on('update-error', (data) => {
      console.log('update-error', data);
    });

    ipcRenderer.on('update-not-available', (data) => {
      console.log('update-not-available', data);
    });

    ipcRenderer.on('update-downloaded', (data) => {
      console.log('update-downloaded', data);
    });

    ipcRenderer.on('update-checking', (data) => {
      console.log('update-checking', data);
    });

    setTimeout(() => {
      ipcRenderer.send('update-check', 1);
      console.log('send');
    }, parseInt('1000'));
  },

  methods: {

  },
};
</script>

<style scoped lang="stylus">

</style>
