<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <board-holder
      :data="drawingData"
    />
  </div>
</template>

<script>
import BoardHolder from '@components/Drawing/BoardHolder';
import janusVideoroomWrapper from '@classes/janusVideoroomWrapper';
import { mapState } from 'vuex';

export default {
  components: {
    BoardHolder,
  },
  data() {
    return {
      drawingData: null,
    };
  },
  computed: {
    ...mapState({
      userId: 'me/id',
      janusOptions: 'janus',
    }),
  },
  async created() {
    await janusVideoroomWrapper.init();
    janusVideoroomWrapper.on('textroom-data', this.onTextroomData.bind(this));
    janusVideoroomWrapper.connectTextroom(this.userId, this.janusOptions);
  },
  beforeDestroy() {
    janusVideoroomWrapper.disconnectTextroom();
    janusVideoroomWrapper.removeAllListeners('textroom-data');
  },
  methods: {
    /**
     * Handles new drawing data from the textroom plugin
     * @param {object} data Drawing data
     * @returns {void}
     */
    onTextroomData(data) {
      console.log('Received drawing data');
      this.$set(this, 'drawingData', data);
    },
  },
};
</script>

<style scoped lang="stylus">
    .layout__popover
        -webkit-app-region drag
        background-color var(--app-bg)
        color var(--text-0)
</style>
