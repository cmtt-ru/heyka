<template>
  <div
    class="layout__popover"
  >
    <router-view />
  </div>
</template>

<script>
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import { mapGetters, mapState } from 'vuex';
import Mousetrap from 'mousetrap';

export default {
  computed: {
    ...mapGetters({
      selectedChannelId: 'me/getSelectedChannelId',
      myId: 'me/getMyId',
    }),
    ...mapState({
      janusOptions: 'janus',
    }),
  },
  watch: {
    async selectedChannelId(newChannelId, oldChannelId) {
      if (!newChannelId && oldChannelId) {
        await janusVideoroomWrapper.leave();
      }
      if (newChannelId) {
        janusVideoroomWrapper.join(this.myId, this.janusOptions);
      }
    },
  },
  async created() {
    await janusVideoroomWrapper.init();

    window.addEventListener('beforeunload', function (e) {
      janusVideoroomWrapper.leave();
    });

    if (this.selectedChannelId) {
      janusVideoroomWrapper.join(this.myId, this.janusOptions);
    }

    if (IS_ELECTRON) {
      Mousetrap.bind('esc', () => {
        window.ipcRenderer.send('exit-fullscreen');
      });
    }
  },
};
</script>

<style lang="stylus" scoped>
  .layout__popover
    width 100vw
    height 100vh
    -webkit-app-region drag
    background var(--Background-black)
</style>
