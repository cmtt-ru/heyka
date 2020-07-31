<template>
  <div
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
    },
  },
  /**
   * Save screen dimensions
   *
   * @returns {object}
   */
  mounted() {
    this.boardDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
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
