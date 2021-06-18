<template>
  <div>
    <janus />
    <notifications />
    <transition name="wireframe-fade">
      <wireframe
        v-if="loading"
        class="wireframe"
      />
    </transition>
    <router-view />
    <modals />
    <app-status :show="!$store.getters['app/getConnectionStatus']" />
    <media-permissions />
    <!--    <performance-monitor />-->
  </div>
</template>

<script>
import Wireframe from '@views/MainWindow/Wireframe';
import Janus from '@components/Janus.vue';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import Notifications from '@components/Notifications';
import AppStatus from '@components/AppStatus';
import MediaPermissions from '@components/MediaPermissions';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
// import PerformanceMonitor from '@components/PerformanceMonitor';
import Logger from '@sdk/classes/logger';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';
import { mapGetters } from 'vuex';
import { heykaStore } from '@/store/localStore';
import { client } from '@api/socket/client';
import notify from '@sdk/libs/notify';
import Modals from '@components/Modals';

const cnsl = new Logger('Mainwindow/index.vue', '#138D75');

const WIREFRAME_MAX_TIME = 10000;

export default {
  components: {
    Janus,
    Notifications,
    AppStatus,
    Wireframe,
    MediaPermissions,
    Modals,
    // PerformanceMonitor,
  },
  data() {
    return {
      updateNotifyClose: null,
      loading: true,
    };
  },

  computed: {
    ...mapGetters({
      mediaState: 'me/getMediaState',
    }),
  },

  async created() {
    try {
      /** Open specific page if it was cached before restart */
      const route = await heykaStore.get('openPage');

      if (route) {
        this.$router.push({ name: route });
        heykaStore.set('openPage', null);
      }

      /** Check authorization */
      await this.$API.auth.check();

      await this.$store.dispatch('initial');
    } catch (e) {
      cnsl.log('redirecting to login', e);
    }
    this.loading = false;

    broadcastEvents.on('open-channel', id => {
      this.$router.push({
        name: 'channel',
        params: { id },
      });
    });

    /**
     * Global Shortcuts stuff
    */
    window.ipcRenderer.on('hotkey-mic', (event, state) => {
      this.$store.dispatch('me/microphoneState', !this.mediaState.microphone);
    });

    /**
     * Auto update stuff
     */
    window.ipcRenderer.on('update-error', (event, error) => {
      cnsl.error('update-error', error);
    });

    window.ipcRenderer.on('update-downloaded', (force) => {
      this.showUpdateNotification();
    });

    window.ipcRenderer.send('update-check');
    window.ipcRenderer.send('tray-animation', false);

    window.addEventListener('beforeunload', () => {
      client.emit('logout');
    });
  },

  mounted() {
    // send signal to index.html so that we can hide super-global wireframe there
    window.removeWireframe();

    window.ipcRenderer.send('page-rendered', 'Hello from Main!');

    /**
     * Deep link for login
     */
    DeepLink.on('login', ([code, error = '']) => {
      console.log('DeepLink login', code, error);

      if (code === 'false') {
        notify(decodeURIComponent(error), {
          icon: 'warning',
        });

        return;
      }

      this.$store.dispatch('useAuthLink', code);
    });

    /**
     * Deep link for open specific workspace
     */
    DeepLink.on('workspace', async ([ workspaceId ]) => {
      console.log('workspaceId', workspaceId);
      if (this.$store.getters['me/getSelectedChannelId']) {
        return;
      }
      await this.$store.dispatch('initial');
      await this.$store.dispatch('changeWorkspace', workspaceId);
    });

    /**
     * Deep link for channel invite
     */
    DeepLink.on('invite', async ([workspaceId, channelId]) => {
      await this.$store.dispatch('initial');
      await this.$store.dispatch('selectChannelInAnotherWorkspace', {
        workspaceId,
        channelId,
      });
      await broadcastEvents.dispatch('open-channel', channelId);
    });

    setTimeout(() => {
      this.loading = false;
    }, WIREFRAME_MAX_TIME);

    window.ipcRenderer.send('start-is-ready');
  },

  beforeDestroy() {
    DeepLink.removeAllListeners('login');
  },

  destroyed() {
    broadcastEvents.removeAllListeners('open-channel');
    window.ipcRenderer.removeAllListeners('update-error');
    window.ipcRenderer.removeAllListeners('update-downloaded');
    window.ipcRenderer.removeAllListeners('hotkey-mic');
  },

  methods: {
    /**
     * Show update install notification
     * @returns {void}
     */
    async showUpdateNotification() {
      if (this.updateNotifyClose) {
        this.updateNotifyClose();
        this.updateNotifyClose = null;
      }

      this.updateNotifyClose = await notify('autoUpdate.message', {
        buttons: [
          {
            text: 'autoUpdate.install',
            type: 1,
            action: () => {
              WindowManager.willQuit();
              window.ipcRenderer.send('update-install');
            },
          },
          {
            text: 'autoUpdate.later',
            close: true,
          },
        ],
      });
    },
  },
};
</script>

<style scoped lang="stylus">
.wireframe
  z-index 2000
  position absolute
  top 0
  bottom 0
  left 0
  right 0

.wireframe-fade-leave-active
  transition all 0.2s ease

.wireframe-fade-enter, .wireframe-fade-leave-to
  opacity 0

</style>
