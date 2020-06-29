<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <router-view />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import janusVideoroomWrapper from '@classes/janusVideoroomWrapper';
import { mapGetters, mapState } from 'vuex';

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
    selectedChannelId(newChannelId, oldChannelId) {
      if (!newChannelId && oldChannelId) {
        janusVideoroomWrapper.leave();
      }
      if (newChannelId) {
        janusVideoroomWrapper.join(this.myId, this.this.janusOptions);
      }
    },
  },
  async created() {
    await janusVideoroomWrapper.init();
    if (this.selectedChannelId) {
      console.log('CURRENT JANUS OPTIONS: ', this.$store.state.janus);
      janusVideoroomWrapper.join(this.myId, this.janusOptions);
    }
  },
  mounted() {
    ipcRenderer.send('page-rendered', 'Hello from Login!');
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
