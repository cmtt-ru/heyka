<template>
  <div>
    <div
      id="drawingPad"
      class="drawing-pad-container"
      @mousemove="mouseMoveHandler"
      @mousedown="mouseDownHandler"
      @mouseup="mouseUpHandler"
    >
      <div

        class="drawing-pad aspect-ratio"
      />
    </div>

    <div class="canvas-holder aspect-ratio">
      <canvas
        id="myCanvas"
        class="drawing"
      />
      <div
        class="dot"
        :style="cursorCoords"
      />
    </div>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce';
import Logger from '@classes/logger';
const cnsl = new Logger('DRAWING', '#fd1');
const DELAY = 20;
const SEND_DELAY = 250;
const FULL_PERCENT = 100;

export default {
  data() {
    return {
      ctx: {},
      drawDimensions: {},
      isMouseDown: false,
      sendDots: [],

      canvasDimensions: {},
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
        top: `${this.lastDrawDot?.y * FULL_PERCENT}%`,
        left: `${this.lastDrawDot?.x * FULL_PERCENT}%`,
      };
    },
  },
  mounted() {
    const canvas = document.getElementById('myCanvas');
    const cs = getComputedStyle(canvas);

    const width = parseInt(cs.getPropertyValue('width'), 10);
    const height = parseInt(cs.getPropertyValue('height'), 10);

    this.canvasDimensions = {
      width,
      height,
    };

    cnsl.log(this.canvasDimensions);

    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d');

    const drawingPad = document.getElementById('drawingPad');
    const dps = getComputedStyle(drawingPad);

    this.drawDimensions = {
      width: parseInt(dps.getPropertyValue('width'), 10),
      height: parseInt(dps.getPropertyValue('height'), 10),
    };
  },
  methods: {
    mouseDownHandler($event) {
      this.isMouseDown = true;
    },
    mouseUpHandler($event) {
      this.isMouseDown = false;
      const dot = {
        x: $event.offsetX,
        y: $event.offsetY,
        time: $event.timeStamp,
        end: true,
      };

      this.pushDot(dot);
      this.addDots([ ...this.sendDots ]);
      this.sendDots = [];
    },
    mouseMoveHandler: throttle(DELAY, false, function ($event) {
      if (this.isMouseDown === false) {
        return;
      }
      const dot = {
        x: $event.offsetX,
        y: $event.offsetY,
        time: $event.timeStamp,
      };

      this.pushDot(dot);
      this.throttleSendDots();
    }),
    pushDot(dot) {
      dot.x = (dot.x / this.drawDimensions.width);
      dot.y = (dot.y / this.drawDimensions.height);
      this.sendDots.push(dot);
    },

    throttleSendDots: throttle(SEND_DELAY, false, function () {
      if (this.sendDots.length > 1) {
        this.addDots([ ...this.sendDots ]);
        this.sendDots = [];
      }
    }),

    addDots(incomeDots) {
      if (this.recieveDots.length === 0) {
        this.recieveDots = [ ...incomeDots.reverse() ];
        setTimeout(() => {
          this.parseRecievedDots();
        }, SEND_DELAY / 2);
      } else {
        this.recieveDots = [...incomeDots.reverse(), ...this.recieveDots];
        setTimeout(() => {
          this.parseRecievedDots();
        }, SEND_DELAY / 2);
      }
    },

    parseRecievedDots() {
      if (this.recieveDots.length === 0 || this.recieveDrawInterval !== null) {
        return;
      }
      cnsl.log('initiate drawing');
      this.recieveDrawInterval = setInterval(() => {
        this.draw();
      }, DELAY);
    },

    draw() {
      if (this.recieveDots.length === 0) {
        cnsl.log('drawing complete');
        clearInterval(this.recieveDrawInterval);
        this.recieveDrawInterval = null;

        return;
      }
      const dot = { ...this.recieveDots.pop() };

      if (this.lastDrawDot) {
        this.ctx.moveTo(this.lastDrawDot.x * this.canvasDimensions.width, this.lastDrawDot.y * this.canvasDimensions.height);
        this.ctx.lineTo(dot.x * this.canvasDimensions.width, dot.y * this.canvasDimensions.height);
        this.ctx.stroke();
      }
      if (dot.end === true) {
        this.lastDrawDot = null;
      } else {
        this.lastDrawDot = { ...dot };
      }
    },
  },
};
</script>

<style scoped lang="stylus">
.drawing-pad-container
    position relative
    margin 8px
    width 300px
    border 1px solid var(--color-1)
    box-sizing border-box
.aspect-ratio
    overflow hidden
    height 0
    padding-bottom 56.25%
.canvas-holder
    position relative
    width calc(100% - 16px)
    margin 8px
    border 1px solid var(--color-1)
    box-sizing border-box
  .drawing
    position absolute
    top 0
    left 0
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
    pointer-events none

</style>
