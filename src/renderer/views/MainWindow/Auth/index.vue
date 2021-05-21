<template>
  <layout>
    <router-view />
  </layout>
</template>

<script>
import Layout from '../Layout';
import connectionCheck from '@sdk/classes/connectionCheck';

export default {
  components: {
    Layout,
  },

  mounted() {
    connectionCheck.appStatusVisibleState(false);
    this.createLocalServer();
  },

  beforeDestroy() {
    this.destroyLocalServer();
  },

  methods: {
    /**
     * Open web server to listen for magic login from web
     *
     * @returns {void}
     */
    createLocalServer() {
      window.ipcRenderer.send('http-create-server');
      window.ipcRenderer.on('http-magic-link', (event, url) => {
        console.log(url);
        this.$store.dispatch('useAuthLink', url);
      });
    },

    /**
     * Destroy local auth server
     * @returns {void}
     */
    destroyLocalServer() {
      window.ipcRenderer.send('http-kill-server'); //! не работает, потому что асинхронно! при ctrl+R приложение перезагрузится, не успев убить сервер на предыдущем порту!
      window.ipcRenderer.removeAllListeners('http-magic-link');
    },
  },
};
</script>
