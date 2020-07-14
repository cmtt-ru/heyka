<template>
  <div class="boards-holder">
    <board
      v-for="(board, userId) in boards"
      :key="userId"
      :income-data="board"
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
    };
  },
  watch: {
    data(val) {
      this.$set(this.boards, val.userId, val);
      // console.log(this.boards);
    },
  },
};
</script>

<style lang="stylus" scoped>
.boards-holder
    position relative
    width 100%
    overflow hidden
    height 0 // ! will be "height 100%"
    padding-bottom 56.25% // ! will be removed
</style>
