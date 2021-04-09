<template>
  <div
    class="layout__popover"
    :style="$themes.getColors('popover')"
  >
    <div
      v-if="canDraw"
      class="board"
    >
      <board-holder
        :data="drawingData"
      />
    </div>
    <div class="frame" />
  </div>
</template>

<script>
import BoardHolder from '@components/Drawing/BoardHolder';
import janusVideoroomWrapper from '@sdk/classes/janusVideoroomWrapper';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import { mapState, mapGetters } from 'vuex';
import Logger from '@sdk/classes/logger';
const cnsl = new Logger('BoardHolderWindow', 'maroon');

const COLORS = [
  '#EFCA08',
  '#613DC1',
  '#EE7674',
  '#D33F49',
  '#F08700',
  '#00A6A6',
  '#266DD3',
  '#C64191'];

export default {
  components: {
    BoardHolder,
  },
  data() {
    return {
      drawingData: {},
      canDraw: false,
    };
  },
  computed: {
    ...mapState({
      janusOptions: 'janus',

    }),
    ...mapGetters({
      userId: 'me/getMyId',
      users: 'usersInMyChannel',
    }),
  },
  created() {
    this.canDraw = this.$store.getters['me/getAllowDraw'];
  },

  async mounted() {
    window.addEventListener('beforeunload', function (e) {
      janusVideoroomWrapper.disconnectTextroom();
    });

    cnsl.info('Hello from board holder window');
    await janusVideoroomWrapper.init();
    janusVideoroomWrapper.on('textroom-data', this.onTextroomData.bind(this));
    janusVideoroomWrapper.on('textroom-joined', this.onNewUser.bind(this));
    cnsl.info('janus options: ', this.userId, this.janusOptions, this.$store, this.$store.state.me.id);
    janusVideoroomWrapper.connectTextroom(this.userId, 'receiver', this.janusOptions);
    broadcastEvents.on('toggleDrawing', (state) => {
      this.canDraw = state;
      this.drawingNotifyUsers();
    });
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
      const from = data.from;
      const drawingData = JSON.parse(data.text);

      drawingData.userId = from
        .replace('(sender)', '');
      this.drawingData = drawingData;
    },

    drawingNotifyUsers() {
      for (const { user } of this.users) {
        this.onNewUser(`${user.id}(sender)`);
      }
    },

    onNewUser(userId) {
      if (typeof this.onNewUser.color === 'undefined') {
        this.onNewUser.color = 0;
      }
      janusVideoroomWrapper.sendData({
        canDraw: this.canDraw,
        color: COLORS[this.onNewUser.color],
      }, userId);
      this.onNewUser.color++;
      if (this.onNewUser.color === COLORS.length) {
        this.onNewUser.color = 0;
      }
    },
  },
};
</script>

<style scoped lang="stylus">
.layout__popover
  background-color transparent

  .board
    width 100vw
    height 100vh

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
