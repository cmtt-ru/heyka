<template>
  <div
    ref="whiteBoard"
    class="boards-holder"
  >
    <board
      v-for="(board, userId) in boards"
      :key="userId"
      :income-data="board"
      :board-dimensions="boardDimensions"
    />
  </div>
</template>

<script>
import Board from '@components/Drawing/Board';
export default {
  components: {
    Board,
  },
  props: {
    /**
     * income data
     */
    data: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      boards: {},
      boardDimensions: {},
    };
  },
  watch: {
    data(val) {
      this.$set(this.boards, val.userId, val);
      console.log(this.boards);
    },
  },
  /**
   * Save screen dimensions
   *
   * @returns {object}
   */
  mounted() {
    const whiteBoard = this.$refs.whiteBoard;
    const cs = getComputedStyle(whiteBoard);

    const width = parseInt(cs.getPropertyValue('width'), 10);
    const height = parseInt(cs.getPropertyValue('height'), 10);

    this.boardDimensions = {
      width,
      height,
    };
  },
};
</script>

<style lang="stylus" scoped>
.boards-holder
    position relative
    width 100%
    overflow hidden
    height 100%
</style>
