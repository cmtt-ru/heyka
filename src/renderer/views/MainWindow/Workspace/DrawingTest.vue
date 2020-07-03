<template>
  <div
    class="drawing"
    @mousemove="mouseMoveHandler"
  >
    <div
      v-for="dot in dots"
      :key="dot.timeStamp"
      :style="dotPosition(dot)"
      class="dot"
    />
  </div>
</template>

<script>

export default {
  data() {
    return {
      dots: [],
    };
  },
  methods: {
    dotPosition(dot) {
      // console.log(dot);

      return {
        top: `${dot.y}px`,
        left: `${dot.x}px`,
      };
    },
    mouseMoveHandler($event) {
      // console.log($event);
      this.dots.push({
        x: $event.offsetX,
        y: $event.offsetY,
        time: $event.timeStamp,
      });
    },
  },
};
</script>

<style scoped lang="stylus">
.drawing
    width calc(100% - 16px)
    height calc(100% - 16px)
    margin 8px
    border 1px solid var(--color-1)
    box-sizing border-box
    position relative

.dot
    position absolute
    width 5px
    height 5px
    border-radius 50%
    background-color blue
</style>
