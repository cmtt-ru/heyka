<template>
  <div class="canvas-holder">
    <canvas
      id="myCanvas"
      class="drawing"
      @mousemove="throttleSavePosition"
    />
    <div
      class="dot"
      :style="cursorCoords"
    />
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce';
const DELAY = 20;
const SEND_DELAY = 250;

export default {
  data() {
    return {
      ctx: {},

      sendDots: [],
      lastDrawDot: null,
      recieveDots: [],
      recieveDrawInterval: null,
    };
  },
  computed: {
    cursorCoords() {
      return {
        top: `${this.lastDrawDot?.y}px`,
        left: `${this.lastDrawDot?.x}px`,
      };
    },
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
    throttleSavePosition: throttle(DELAY, false, function ($event) {
      const dot = {
        x: $event.offsetX,
        y: $event.offsetY,
        time: Math.round($event.timeStamp),
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    }),

    throttleSendDots: throttle(SEND_DELAY, false, function () {
      this.addDots(this.sendDots);
    }),

    addDots(incomeDots) {
      const newIndex = incomeDots.findIndex(el => el.time === this.recieveDots[this.recieveDots.length - 1]?.time);

      if (newIndex === -1) {
        this.recieveDots = [ ...incomeDots ];
      } else {
        this.recieveDots = [...this.recieveDots, ...incomeDots.slice(newIndex)];
      }

      setTimeout(() => {
        this.parseRecievedDots();
      }, SEND_DELAY);
    },

    parseRecievedDots() {
      if (this.recieveDots.length === 1 || this.recieveDrawInterval !== null) {
        return;
      }
      this.recieveDrawInterval = setInterval(() => {
        this.draw();
      }, DELAY);
    },

    draw() {
      if (this.recieveDots.length === 1) {
        clearInterval(this.recieveDrawInterval);
        this.recieveDrawInterval = null;

        return;
      }
      const dot = { ...this.recieveDots.shift() };

      if (this.lastDrawDot) {
        this.ctx.moveTo(this.lastDrawDot.x, this.lastDrawDot.y);
        this.ctx.lineTo(dot.x, dot.y);
        this.ctx.stroke();
      };
      this.lastDrawDot = { ...dot };
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
.canvas-holder
    position relative
.dot
    position absolute
    width 5px
    height 5px
    border-radius 50%
    background-color blue
</style>
