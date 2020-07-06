<template>
  <canvas
    id="myCanvas"
    class="drawing"
    @mousemove="throttleSavePosition"
  />
</template>

<script>
import { throttle } from 'throttle-debounce';
const DELAY = 20;

export default {
  data() {
    return {
      ctx: {},
      lastDot: null,
    };
  },
  computed: {

  },
  mounted() {
    const canvas = document.getElementById('myCanvas');
    const cs = getComputedStyle(canvas);

    const width = parseInt(cs.getPropertyValue('width'), 10);
    const height = parseInt(cs.getPropertyValue('height'), 10);

    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d');
  },
  methods: {
    throttleSavePosition:
      throttle(DELAY, false, function ($event) {
        const dot = {
          x: $event.offsetX,
          y: $event.offsetY,
        };

        if (this.lastDot) {
          this.ctx.moveTo(this.lastDot.x, this.lastDot.y);
          this.ctx.lineTo(dot.x, dot.y);
          this.ctx.stroke();
        }
        this.lastDot = dot;
      }),
    // dotPosition(dot) {
    //   // console.log(dot);

    //   return {
    //     top: `${dot.y}px`,
    //     left: `${dot.x}px`,
    //   };
    // },
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
