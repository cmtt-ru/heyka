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
  },

  methods: {

  },
};
</script>

<style scoped lang="stylus">

</style>
