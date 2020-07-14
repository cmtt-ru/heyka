<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <div class="board">
      <board-holder
        :data="drawingData"
      />
    </div>
    <div class="frame" />
  </div>
</template>

<script>
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import BoardHolder from '@components/Drawing/BoardHolder';
import janusVideoroomWrapper from '@classes/janusVideoroomWrapper';
import { mapState, mapGetters } from 'vuex';
import Logger from '@classes/logger';
const cnsl = new Logger('BoardHolderWindow', 'maroon');

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
      janusOptions: 'janus',
    }),
    ...mapGetters({
      userId: 'me/getMyId',
    }),
  },
  async mounted() {
    cnsl.info('Hello from board holder window');
    WindowManager.getCurrentWindow().action('console');
    await janusVideoroomWrapper.init();
    janusVideoroomWrapper.on('textroom-data', this.onTextroomData.bind(this));
    cnsl.info('janus options: ', this.userId, this.janusOptions, this.$store, this.$store.state.me.id);
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
  background-color transparent

  .board
    width 100%
    height 100%

  .frame
    position absolute
    top 0px
    left 0px
    width 100vw
    height 100vh
    border 5px solid #50ef39
    box-sizing border-box
    /*animation: fade 2s linear infinite alternate;*/

@keyframes fade
  0%
    opacity 1
    border-color #50ef39
  100%
    opacity 1
    border-color #ef3330
</style>
