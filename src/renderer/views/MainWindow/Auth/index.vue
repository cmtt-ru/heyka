<template>
  <layout>
    <router-view />
  </layout>
</template>

<script>
import Layout from '../Layout';
import connectionCheck from '@sdk/classes/connectionCheck';
import * as http from 'http';

/**
 * Ports for local auth server
 * @type {number[]}
 */
// eslint-disable-next-line no-magic-numbers
const PORTS = [9615, 48757, 48852, 49057, 49086];

/**
 * Local http auth server instance
 * @type {Server}
 */
let localAuthServer = null;

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
     * @param {number} portIndex - port to listen to
     * @returns {void}
     */
    createLocalServer(portIndex = 0) {
      if (portIndex === PORTS.length) {
        return;
      }

      localAuthServer = http.createServer((req, res) => {
        console.log(req.url);
        this.$store.dispatch('useAuthLink', req.url.substr(1));
        res.end('heyka');
        localAuthServer.close();
      });

      localAuthServer.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          localAuthServer.close();
          console.log(`Local auth server --> port '${PORTS[portIndex]}' is in use`);
          this.createLocalServer(portIndex + 1);
        }
      });

      localAuthServer.listen(PORTS[portIndex], '127.0.0.1');
    },

    /**
     * Destroy local auth server
     * @returns {void}
     */
    destroyLocalServer() {
      localAuthServer.close();
      localAuthServer = null;
    },
  },
};
</script>
