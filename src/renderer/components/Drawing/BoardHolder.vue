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
    },
  },
};
</script>

<style lang="stylus" scoped>
.boards-holder
    position relative
    width calc(100% - 16px)
    margin 8px
    border 1px solid var(--color-1)
    background-color #222
    overflow hidden
    height 0
    padding-bottom 56.25%
</style>
