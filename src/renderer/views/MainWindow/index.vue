<template>
  <div>
    <janus />
    <notifications />
    <router-view />
    <!--    <performance-monitor />-->
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import Janus from '@components/Janus.vue';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import Notifications from '@components/Notifications';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import mediaCapturer from '@classes/mediaCapturer';
// import PerformanceMonitor from '@components/PerformanceMonitor';
import Logger from '@sdk/classes/logger';
import { prepareTokens } from '@api/tokens';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';
import { mapGetters } from 'vuex';
import { heykaStore } from '@/store/localStore';

const cnsl = new Logger('Mainwindow/index.vue', '#138D75');

export default {
  components: {
    Janus,
    Notifications,
    // PerformanceMonitor,
  },
  data() {
    return {
      updateNotificationShown: false,
    };
  },

  computed: {
    ...mapGetters({
      mediaState: 'me/getMediaState',
    }),
  },

  async created() {
    try {
      /** Open settings if after crucial settings changed */
      if (heykaStore.get('openSettings')) {
        this.$router.push({ name: 'settings' });
        heykaStore.set('openSettings', null);
      }

      /** Prepare tokens */
      await prepareTokens();

      /** Check authorization */
      await this.$API.auth.check();

      await this.$store.dispatch('initial');
    } catch (e) {
      cnsl.log('redirecting to login', e);
    }

    broadcastEvents.on('open-channel', id => {
      this.$router.push({
        name: 'channel',
        params: { id },
      });
    });

    /**
     * Global Shortcuts stuff
    */
    ipcRenderer.on('hotkey-mic', (event, state) => {
      this.$store.dispatch('me/microphoneState', !this.mediaState.microphone);
    });

    /**
     * Auto update stuff
     */
    ipcRenderer.on('update-error', (event, error) => {
      cnsl.error('update-error', error);
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

  mounted() {
    /**
     * Deep link for login
     */
    DeepLink.on('login', ([ code ]) => {
      console.log('useAuthLink', code);
      this.$store.dispatch('useAuthLink', code);
    });

    /**
     * Deep link for open specific workspace
     */
    DeepLink.on('workspace', async ([ workspaceId ]) => {
      console.log('workspaceId', workspaceId);
      await this.$store.dispatch('workspaces/updateList');
      await this.$store.dispatch('changeWorkspace', workspaceId);
    });

    ipcRenderer.send('start-is-ready');
  },

  beforeDestroy() {
    DeepLink.removeAllListeners('login');
  },

  destroyed() {
    broadcastEvents.removeAllListeners('open-channel');
    ipcRenderer.removeAllListeners('update-error');
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.removeAllListeners('hotkey-mic');
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
