import {ipcRenderer} from "electron";
<template>
  <div>
    <janus />
    <notifications/>
    <router-view></router-view>
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

  methods: {

  },

  async created() {
    try {
      await this.$API.auth.check();

      ipcRenderer.on('default-behaviour', (event, arg) => {
        this.$router.replace('/main-window/workspace');
      });

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
  },
};
</script>

<style scoped lang="stylus">

</style>
