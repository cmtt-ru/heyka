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

    <ui-switch
      v-model="drawingMode"
      text="Режим рисования"
    />

    <div
      id="mySVG"
      class="canvas-holder aspect-ratio"
    >
      <div
        id="myCanvas"
        class="drawing"
      >
        <svg
          :viewBox="viewBox"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path
              v-for="(stroke, index) in completedPaths"
              :key="index"
              class="svg-path"
              :d="stroke"
            />
            <path
              class="svg-path"
              :d="currentPath()"
            />
          </g>
        </svg>
      </div>
      <user-cursor
        class="cursor"
        :style="cursorCoordsStyle"
        color="#DE4B39"
        :user="me"
      />
    </div>
  </div>
</template>

<script>
import { UiSwitch } from '@components/Form';
import UserCursor from '@components/UserCursor';
import { mapGetters } from 'vuex';
import { throttle } from 'throttle-debounce';
// import Logger from '@classes/logger';
// const cnsl = new Logger('DRAWING', '#fd1');
const DELAY = 10;
const SEND_DELAY = 250;
const SMOOTHING = 0.15;
const NEIGHBOUR_DISTANCE = 0.025;

export default {
  components: {
    UiSwitch,
    UserCursor,
  },
  data() {
    return {
      drawingMode: true,
      lastPoint: null,
      ctx: {},
      drawDimensions: {},
      isMouseDown: false,
      sendDots: [],

      canvasDimensions: {},
      cursorCoords: null,
      lastDrawDot: null,
      recieveDots: [],
      recieveDrawInterval: null,
      visibleDots: [],
      completedPaths: [],
    };
  },
  computed: {
    ...mapGetters({
      me: 'myInfo',
    }),
    cursorCoordsStyle() {
      if (this.cursorCoords === null || this.canvasDimensions === null) {
        return {
          visibility: 'hidden',
        };
      }

      return {
        transform: `translate(${this.cursorCoords.x * this.canvasDimensions.width}px, ${this.cursorCoords.y * this.canvasDimensions.height}px)`,
      };
    },
    viewBox() {
      return `0 0 ${this.canvasDimensions.width || 0} ${this.canvasDimensions.height || 0}`;
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
      const dot = {
        x: $event.offsetX / this.drawDimensions.width,
        y: $event.offsetY / this.drawDimensions.height,
        time: $event.timeStamp,
        start: true,
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    },
    mouseUpHandler($event) {
      this.isMouseDown = false;
      const dot = {
        x: $event.offsetX / this.drawDimensions.width,
        y: $event.offsetY / this.drawDimensions.height,
        time: $event.timeStamp,
        end: true,
      };

      this.sendDots.push(dot);
      this.addDots([ ...this.sendDots ]);
      this.sendDots = [];
      this.lastPoint = null;
    },
    mouseMoveHandler: throttle(DELAY, false, function ($event) {
      if (this.isMouseDown === false && this.drawingMode === true) {
        return;
      }
      const dot = {
        x: $event.offsetX / this.drawDimensions.width,
        y: $event.offsetY / this.drawDimensions.height,
        time: $event.timeStamp,
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    }),
    checkNoNeighbour(dot) {
      if (this.lastPoint === null) {
        this.lastPoint = dot;

        return true;
      }
      const distance = Math.sqrt((dot.x - this.lastPoint.x) ** 2 + (dot.y - this.lastPoint.y) ** 2);

      // console.log(distance);
      if (distance > NEIGHBOUR_DISTANCE) {
        this.lastPoint = dot;

        return true;
      }

      return false;
    },

    throttleSendDots: throttle(SEND_DELAY, false, function () {
      if (this.sendDots.length > 0) {
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
      if (this.drawingMode) {
        this.recieveDrawInterval = setInterval(() => {
          this.updateLine();
        }, DELAY);
      } else {
        this.recieveDrawInterval = setInterval(() => {
          this.updateCursor();
        }, DELAY);
      }
    },
    updateCursor() {
      if (this.recieveDots.length === 0) {
        clearInterval(this.recieveDrawInterval);
        this.recieveDrawInterval = null;

        return;
      }
      this.cursorCoords = { ...this.recieveDots.pop() };
    },
    updateLine() {
      if (this.recieveDots.length === 0) {
        clearInterval(this.recieveDrawInterval);
        this.recieveDrawInterval = null;

        return;
      }
      const dot = { ...this.recieveDots.pop() };

      if (this.checkNoNeighbour(dot) === false && this.visibleDots.length > 1) {
        this.visibleDots.pop();
      } else {
        this.lastDrawDot = dot;
      }
      this.visibleDots.push([dot.x * this.canvasDimensions.width, dot.y * this.canvasDimensions.height]);

      if (dot.end === true) {
        this.completedPaths.push(this.currentPath());
        this.cursorCoords = null;
        this.lastDrawDot = null;
        this.visibleDots = [];
      } else {
        this.cursorCoords = dot;
      }
    },

    line: (pointA, pointB) => {
      const lengthX = pointB[0] - pointA[0];
      const lengthY = pointB[1] - pointA[1];

      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
      };
    },
    controlPoint: (line, smooth) => (current, previous, next, reverse) => {
      const p = previous || current;
      const n = next || current;
      const l = line(p, n);

      const angle = l.angle + (reverse ? Math.PI : 0);
      const length = l.length * smooth;
      const x = current[0] + Math.cos(angle) * length;
      const y = current[1] + Math.sin(angle) * length;

      return [x, y];
    },
    bezierCommand: (controlPoint) => (point, i, a) => {
      const cps = controlPoint(a[i - 1], a[i - 2], point);
      const cpe = controlPoint(point, a[i - 1], a[i + 1], true);

      return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
    },
    svgPath: (pointsArr, command) => {
      const d = pointsArr.reduce((acc, e, i, a) => i === 0
        ? `M ${e[0]},${e[1]}`
        : `${acc} ${command(e, i, a)}`
      , '');

      return d;
    },
    currentPath() {
      const bezierCommandCalc = this.bezierCommand(this.controlPoint(this.line, SMOOTHING));
      const path = this.svgPath(this.visibleDots, bezierCommandCalc);

      return path;
    },

  },
};
</script>
<style scoped lang="stylus">
.svg-path
    fill transparent
    stroke white
    stroke-width 4px
    stroke-opacity 1
    stroke-linecap round

.drawing-pad-container
    position relative
    margin 8px
    width 600px
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
    background-color #222
  .drawing
    position absolute
    top 0
    left 0
    width 100%
    height 100%
.cursor
    position absolute
    top 0
    left 0

</style>
