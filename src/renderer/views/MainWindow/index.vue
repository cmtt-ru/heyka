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
import broadcastEvents from '@classes/broadcastEvents';
import Notifications from '@components/Notifications';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import mediaCapturer from '@classes/mediaCapturer';

export default {
  components: {
    Janus,
    Notifications,
  },
  data() {
    return {
      deepLink: {},
      updateNotificationShown: false,
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

    broadcastEvents.on('open-channel', id => {
      this.$router.push({
        name: 'channel',
        params: { id },
      });
    });

    /**
     * Auto update stuff
     */
    ipcRenderer.on('update-error', (event, error) => {
      console.log('update-error', error);
    });

    ipcRenderer.on('update-downloaded', () => {
      if (!this.updateNotificationShown) {
        this.showUpdateNotification();
        this.updateNotificationShown = true;
      }
    });

    ipcRenderer.send('update-check');
    ipcRenderer.send('tray-animation', false);

    this.showMacScreenSharingPermission();
  },

  destroyed() {
    broadcastEvents.removeAllListeners('open-channel');
  },

  methods: {
    /**
     * Show update install notification
     * @returns {void}
     */
    async showUpdateNotification() {
      const texts = this.$t('autoUpdate');

      const notification = {
        infinite: true,
        data: {
          text: texts.message,
          buttons: [
            {
              text: texts.install,
              type: 1,
              action: () => {
                WindowManager.willQuit();
                ipcRenderer.send('update-install');
                // electron.remote.app.relaunch();
                // electron.remote.app.quit();
              },
            },
            {
              text: texts.later,
              close: true,
            },
          ],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    /**
     * Show mac screen sharing permission
     * @returns {void}
     */
    async showMacScreenSharingPermission() {
      const timeout = 1000;

      if (IS_MAC) {
        const screens = await mediaCapturer.getSources('screen', 0);
        const stream = await mediaCapturer.getStream(screens[0].id);

        setTimeout(() => {
          mediaCapturer.destroyStream(stream);
        }, timeout);
      }
    },
  },
};
</script>

<style scoped lang="stylus">

</style>
