<template>
  <div class="canvas-holder">
    <canvas
      id="myCanvas"
      class="drawing"
      @mousemove="mouseMoveHandler"
      @mousedown="mouseDownHandler"
      @mouseup="mouseUpHandler"
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
      isMouseDown: false,
      sendDots: [],
      lastDrawDot: null,
      recieveDots: [],
      recieveDrawInterval: null,
    };
  },
  computed: {
    cursorCoords() {
      if (this.lastDrawDot === null) {
        return {
          visibility: 'hidden',
        };
      }

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
    mouseDownHandler($event) {
      this.isMouseDown = true;
      const dot = {
        x: $event.offsetX,
        y: $event.offsetY,
        time: Math.round($event.timeStamp),
        start: true,
      };

      this.sendDots.push(dot);
    },
    mouseUpHandler($event) {
      this.isMouseDown = false;
      const dot = {
        x: $event.offsetX,
        y: $event.offsetY,
        time: Math.round($event.timeStamp),
        end: true,
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    },
    mouseMoveHandler: throttle(DELAY, false, function ($event) {
      if (this.isMouseDown === false) {
        return;
      }
      const dot = {
        x: $event.offsetX,
        y: $event.offsetY,
        time: Math.round($event.timeStamp),
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    }),

    throttleSendDots: throttle(SEND_DELAY, false, function () {
      this.addDots([ ...this.sendDots ]);
    }),

    addDots(incomeDots) {
      if (this.recieveDots.length === 0) {
        this.recieveDots = [ ...incomeDots.reverse() ];

        return;
      }
      const newIndex = incomeDots.findIndex(el => el.time === this.recieveDots[0].time);

      if (newIndex === -1) {
        this.recieveDots = [ ...incomeDots.reverse() ];
      } else {
        this.recieveDots = [...incomeDots.slice(newIndex).reverse(), ...this.recieveDots];
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

        if (this.recieveDots[0].end === true) {
          this.lastDrawDot = null;
          console.log(this.recieveDots[0]);
        }

        return;
      }
      const dot = { ...this.recieveDots.pop() };

      if (dot.end === true) {
        return;
      }

      if (this.lastDrawDot) {
        this.ctx.moveTo(this.lastDrawDot.x, this.lastDrawDot.y);
        this.ctx.lineTo(dot.x, dot.y);
        this.ctx.stroke();
      }
      this.lastDrawDot = { ...dot };
    },
  },
};
</script>

<style scoped lang="stylus">
.canvas-holder
    position relative
    width calc(100% - 16px)
    height calc(100% - 16px)
    margin 8px
    border 1px solid var(--color-1)
    box-sizing border-box
  .drawing
    position relative
    width 100%
    height 100%
.dot
    position absolute
    width 0
    height 0
    border-left 20px solid blue
    border-left 20px solid blue
    border-right 20px solid transparent
    border-bottom 20px solid transparent

</style>
