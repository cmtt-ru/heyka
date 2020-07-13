<template>
  <div
    class="canvas-holder"
  >
    <div
      ref="svgBoard"
      class="drawing"
    >
      <svg
        ref="svgPaths"
        :viewBox="svgViewBox"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g :stroke="color">
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
          <path
            class="svg-path"
            :d="currentRect()"
          />
        </g>
      </svg>
    </div>
    <div
      ref="hightlight"
      class="click-highlight"
      :style="clickHighlightStyle"
    />
    <user-cursor
      class="cursor"
      :style="cursorCoordsStyle"
      :color="color"
      :user="user"
    />
  </div>
</template>

<script>
import UserCursor from '@components/Drawing/UserCursor';
import { setInterval, clearInterval } from 'requestanimationframe-timer';

const DELAY = 33;
const RECIEVE_DELAY = 150;
const SMOOTHING = 0.2;
const NEIGHBOUR_DISTANCE = 0.05;
const TIME_BEFORE_CLEAR = 10000;

let __savedCurrentPath = '';
let __savedCurrentLength = 0;

export default {
  components: {
    UserCursor,
  },
  props: {
    /**
     * income object with drawing mode & dots array
     */
    incomeData: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      boardDimensions: {},
      cursorCoords: null,
      highlightCoords: null,
      lastPoint: null,
      dotsQueue: [],
      recieveDrawInterval: null,
      clearWhiteBoardTimeout: null,
      visibleDots: [],
      completedPaths: [],
      startRectPosition: null,
    };
  },
  computed: {
    cursorCoordsStyle() {
      if (this.cursorCoords === null || this.boardDimensions === null) {
        return {
          visibility: 'hidden',
        };
      }

      return {
        transform: `translate(${this.cursorCoords.x * this.boardDimensions.width}px, ${this.cursorCoords.y * this.boardDimensions.height}px)`,
      };
    },
    clickHighlightStyle() {
      if (this.highlightCoords === null || this.boardDimensions === null) {
        return {
          visibility: 'hidden',
        };
      }

      return {
        'border-color': this.color,
        top: `${this.highlightCoords.y * this.boardDimensions.height}px`,
        left: `${this.highlightCoords.x * this.boardDimensions.width}px`,
      };
    },
    svgViewBox() {
      return `0 0 ${this.boardDimensions.width || 0} ${this.boardDimensions.height || 0}`;
    },
    drawingMode() {
      return this.incomeData.drawing || false;
    },
    newDots() {
      return this.incomeData.dots || [];
    },
    color() {
      return this.incomeData.color || '#000';
    },
    userId() {
      return this.incomeData.userId || '';
    },
    user() {
      return this.$store.getters['users/getUserById'](this.userId) || {};
    },
  },

  watch: {
    newDots(val) {
      this.addDots([ ...val ]);
    },
  },
  mounted() {
    const svgBoard = this.$refs.svgBoard;
    const cs = getComputedStyle(svgBoard);

    const width = parseInt(cs.getPropertyValue('width'), 10);
    const height = parseInt(cs.getPropertyValue('height'), 10);

    this.boardDimensions = {
      width,
      height,
    };
  },
  methods: {
    addDots(incomeDots) {
      if (this.dotsQueue.length === 0) {
        this.dotsQueue = incomeDots.reverse();
        setTimeout(() => {
          this.parseRecievedDots();
        }, RECIEVE_DELAY);
      } else {
        this.dotsQueue = [...incomeDots.reverse(), ...this.dotsQueue];
        setTimeout(() => {
          this.parseRecievedDots();
        }, RECIEVE_DELAY);
      }
    },

    parseRecievedDots() {
      if (this.dotsQueue.length === 0 || this.recieveDrawInterval !== null) {
        return;
      }
      if (this.drawingMode) {
        clearTimeout(this.clearWhiteBoardTimeout);
        this.$refs.svgPaths.classList.remove('svg--hiding');
        this.recieveDrawInterval = setInterval(() => {
          this.updatePath();
        }, DELAY);
      } else {
        this.recieveDrawInterval = setInterval(() => {
          this.updateCursor();
        }, DELAY);
      }
    },
    updateCursor() {
      if (this.dotsQueue.length === 0) {
        clearInterval(this.recieveDrawInterval);
        this.recieveDrawInterval = null;

        return;
      }
      this.cursorCoords = { ...this.dotsQueue.pop() };
      if (this.cursorCoords.start === true) {
        this.highLightClick(this.cursorCoords);
      }
    },

    reflow(el, className) {
      el.classList.add(className);
      el.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight; /* trigger reflow */
      el.style.animation = null;
    },

    highLightClick(dot) {
      this.highlightCoords = dot;
      this.reflow(this.$refs.hightlight, 'click-highlight--visible');
    },

    checkNoNeighbour(dot) {
      if (this.lastPoint === null) {
        this.lastPoint = dot;

        return true;
      }
      const distance = Math.sqrt((dot.x - this.lastPoint.x) ** 2 + (dot.y - this.lastPoint.y) ** 2);

      if (distance > NEIGHBOUR_DISTANCE) {
        this.lastPoint = dot;

        return true;
      }

      return false;
    },

    updatePath() {
      if (this.dotsQueue.length === 0) {
        if (this.recieveDrawInterval !== null) {
          clearInterval(this.recieveDrawInterval);
          this.recieveDrawInterval = null;
        }

        return;
      }
      const dot = { ...this.dotsQueue.pop() };

      if (dot.rect) {
        this.startRectPosition = {
          x: dot.x * this.boardDimensions.width,
          y: dot.y * this.boardDimensions.height,
        };

        return;
      }

      if (this.startRectPosition === null) {
        if (this.checkNoNeighbour(dot) === false && this.visibleDots.length > 1) {
          this.visibleDots.pop();
        }
        this.visibleDots.push([dot.x * this.boardDimensions.width, dot.y * this.boardDimensions.height]);
      }

      if (dot.end === true) {
        if (this.startRectPosition) {
          this.completedPaths.push(this.currentRect());
          this.startRectPosition = null;
        } else {
          this.completedPaths.push(this.currentPath());
          this.visibleDots = [];
          __savedCurrentPath = '';
        }

        this.cursorCoords = null;

        this.$refs.svgPaths.classList.add('svg--hiding');
        this.clearWhiteBoardTimeout = setTimeout(() => {
          this.completedPaths = [];
        }, TIME_BEFORE_CLEAR);
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

      return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]} `;
    },
    svgPath(pointsArr, command) {
      const length = pointsArr.length;
      const minSaveLength = 4;

      if (length < minSaveLength) {
        return pointsArr.reduce((acc, e, i, a) => i === 0
          ? `M ${e[0]},${e[1]}`
          : `${acc} ${command(e, i, a)}`
        , '');
      } else if (length === minSaveLength) {
        __savedCurrentLength = minSaveLength;
        __savedCurrentPath = `M ${pointsArr[0][0]},${pointsArr[0][1]} ${command(pointsArr[1], 1, pointsArr)}`;

        return pointsArr.reduce((acc, e, i, a) => i === 0
          ? `M ${e[0]},${e[1]}`
          : `${acc} ${command(e, i, a)}`
        , ''); ;
      }
      // eslint-disable-next-line no-magic-numbers
      const fiveLastDots = pointsArr.slice(-5);

      if (__savedCurrentLength !== length) {
        __savedCurrentPath += command(fiveLastDots[2], 2, fiveLastDots);
        __savedCurrentLength = length;
      }

      // eslint-disable-next-line no-magic-numbers
      return __savedCurrentPath + command(fiveLastDots[3], 3, fiveLastDots) + command(fiveLastDots[4], 4, fiveLastDots);
    },
    currentPath() {
      if (this.visibleDots.length === 0) {
        return;
      }
      const bezierCommandCalc = this.bezierCommand(this.controlPoint(this.line, SMOOTHING));
      const path = this.svgPath(this.visibleDots, bezierCommandCalc);

      return path;
    },

    currentRect() {
      if (this.startRectPosition === null || this.cursorCoords === null) {
        return '';
      }

      return `M${this.startRectPosition.x},${this.startRectPosition.y} ${this.cursorCoords.x * this.boardDimensions.width},${this.startRectPosition.y} ${this.cursorCoords.x * this.boardDimensions.width},${this.cursorCoords.y * this.boardDimensions.height} ${this.startRectPosition.x},${this.cursorCoords.y * this.boardDimensions.height} z`;
    },
  },

};
</script>

<style lang="stylus" scoped>
.svg-path
    fill transparent
    stroke-width 4px
    stroke-opacity 1
    stroke-linecap round

.svg--hiding
    animation 10s 1 forwards svgClear

@keyframes svgClear {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }

}

.canvas-holder
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    background-color transparent
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

.click-highlight
    position absolute
    top 0
    left 0
    width 60px
    height 60px
    transform translate(-33px, -33px) scale(1)
    transform-origin center
    background-color transparent
    border 4px solid
    border-radius 50%
    opacity 0

    &--visible
        animation 0.7s 1 forwards click;

@keyframes click {
  0% {
    opacity: 0;
    transform: translate(-33px, -33px) scale(0.7);
  }
  20% {
    opacity: 1;
    transform: translate(-33px, -33px) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translate(-33px, -33px) scale(1);
  }

}
</style>
