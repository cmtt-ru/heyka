<template>
  <div
    class="drawing"
    @mousemove="throttleSavePosition"
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
import { throttle } from 'throttle-debounce';
const DELAY = 50;

export default {
  data() {
    return {
      dots: [],
    };
  },
  computed: {

  },
  methods: {
    throttleSavePosition:
      throttle(DELAY, false, function ($event) {
        this.dots.push({
          x: $event.offsetX,
          y: $event.offsetY,
          time: $event.timeStamp,
        });
      }),
    dotPosition(dot) {
      // console.log(dot);

      return {
        top: `${dot.y}px`,
        left: `${dot.x}px`,
      };
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
