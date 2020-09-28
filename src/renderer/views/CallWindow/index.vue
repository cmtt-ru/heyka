import {ipcRenderer} from "electron";
<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <router-view />
  </div>
</template>

<script>
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import { mapGetters, mapState } from 'vuex';
import Mousetrap from 'mousetrap';
import { ipcRenderer } from 'electron';

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
    if (this.selectedChannelId) {
      janusVideoroomWrapper.join(this.myId, this.janusOptions);
    }

    Mousetrap.bind('esc', () => {
      ipcRenderer.send('exit-fullscreen');
    });
  },
};
</script>

<style scoped lang="stylus">
    .layout__popover
        width 100vw
        height 100vh
        -webkit-app-region drag
        background-color var(--app-bg)
        color var(--text-0)
</style>
