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

/* throttle delay between grawing dots (should be same as in sender, Tablet.vue) */
const DELAY = 33;
/* delay made for small dots buffering */
const RECIEVE_DELAY = 150;
/* smoothing for svg lines */
const SMOOTHING = 0.2;
/* smallest distance between dots in svg line */
const NEIGHBOUR_DISTANCE = 0.05;
/* after this time of idling lines will dissappear (they'll start dissapearing at 70% of this time)*/
const TIME_BEFORE_CLEAR = 10000;

/* variables for complex caching current svg line */
let __savedCurrentPath = '';
let __savedCurrentLength = 0;

let __boardDimensions = {};
let __lastPoint = null;
let __dotsQueue = [];
let __recieveDrawInterval = null;
let __clearWhiteBoardTimeout = null;
let __startRectPosition = null;
let __visibleDots = [];

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
      cursorCoords: null,
      highlightCoords: null,
      completedPaths: [],

    };
  },
  computed: {
    /**
     * Position cursor
     * @returns {object}
     */
    cursorCoordsStyle() {
      if (this.cursorCoords === null || __boardDimensions === null) {
        return {
          visibility: 'hidden',
        };
      }

      return {
        transform: `translate(${this.cursorCoords.x * __boardDimensions.width}px, ${this.cursorCoords.y * __boardDimensions.height}px)`,
      };
    },
    /**
     * Position click animation
     * @returns {object}
     */
    clickHighlightStyle() {
      if (this.highlightCoords === null || __boardDimensions === null) {
        return {
          visibility: 'hidden',
        };
      }

      return {
        'border-color': this.color,
        top: `${this.highlightCoords.y * __boardDimensions.height}px`,
        left: `${this.highlightCoords.x * __boardDimensions.width}px`,
      };
    },
    /**
     * set viewbox for svg canvas
     * @returns {string}
     */
    svgViewBox() {
      return `0 0 ${__boardDimensions.width || 0} ${__boardDimensions.height || 0}`;
    },
    /**
     * drawing mode (move cursor or dral lines)
     * @returns {boolean}
     */
    drawingMode() {
      return this.incomeData.drawing || false;
    },
    /**
     * new income dots array
     * @returns {array}
     */
    newDots() {
      return this.incomeData.dots || [];
    },
    /**
     * color of line
     * @returns {string}
     */
    color() {
      return this.incomeData.color || '#000';
    },
    /**
     * sender's id
     * @returns {string}
     */
    userId() {
      return this.incomeData.userId || '';
    },
    /**
     * sender's profile data
     * @returns {object}
     */
    user() {
      return this.$store.getters['users/getUserById'](this.userId) || {};
    },
  },

  watch: {
    /**
     * Add all incoming dots to local queue
     * @param {array} val - array with dots
     * @returns {void}
     */
    newDots(val) {
      this.addDots([ ...val ]);
    },
  },
  /**
   * save screen dimensions
   * @returns {object}
   */
  mounted() {
    const svgBoard = this.$refs.svgBoard;
    const cs = getComputedStyle(svgBoard);

    const width = parseInt(cs.getPropertyValue('width'), 10);
    const height = parseInt(cs.getPropertyValue('height'), 10);

    __boardDimensions = {
      width,
      height,
    };
  },
  methods: {
    /**
     * Add new dots to local queue and trigger 'parseRecievedDots' after RECIEVE_DELAY
     * @param {array} incomeDots - array with dots
     * @returns {void}
     */
    addDots(incomeDots) {
      if (__dotsQueue.length === 0) {
        __dotsQueue = incomeDots.reverse();
      } else {
        __dotsQueue = [...incomeDots.reverse(), ...__dotsQueue];
      }
      setTimeout(() => {
        this.parseRecievedDots();
      }, RECIEVE_DELAY);
    },

    /**
     * Parse new dots: start drawing line or moving cursor if no drawing is currently taking place
     * @returns {void}
     */
    parseRecievedDots() {
      if (__dotsQueue.length === 0 || __recieveDrawInterval !== null) {
        return;
      }
      if (this.drawingMode) {
        clearTimeout(__clearWhiteBoardTimeout);
        this.$refs.svgPaths.classList.remove('svg--hiding');
        __recieveDrawInterval = setInterval(() => {
          this.updatePath();
        }, DELAY);
      } else {
        __recieveDrawInterval = setInterval(() => {
          this.updateCursor();
        }, DELAY);
      }
    },

    /**
     * update cursor coords (if drawingMode === false) and trigger click animation on click
     * @returns {void}
     */
    updateCursor() {
      if (__dotsQueue.length === 0) {
        clearInterval(__recieveDrawInterval);
        __recieveDrawInterval = null;

        return;
      }
      this.cursorCoords = { ...__dotsQueue.pop() };
      if (this.cursorCoords.start === true) {
        this.highLightClick(this.cursorCoords);
      }
    },

    /**
     * HACK (sorry!) to make element reflow (and re-trigger its css animation)
     * @param {object} el - element to reflow
     * @returns {void}
     */
    reflow(el) {
      el.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight; /* trigger reflow */
      el.style.animation = null;
    },

    /**
     * move highlight animation to current coordinates and re-trigger animation (with the help of reflow)
     * @param {object} dot - coords to move animation to
     * @returns {void}
     */
    highLightClick(dot) {
      this.highlightCoords = dot;
      this.reflow(this.$refs.hightlight);
    },

    /**
     * check if distance between two last dots is bigger than NEIGHBOUR_DISTANCE
     * @param {object} dot - current dot position
     * @returns {boolean} true if no nearby dots
     */
    checkNoNeighbour(dot) {
      if (__lastPoint === null) {
        __lastPoint = dot;

        return true;
      }
      const distance = Math.sqrt((dot.x - __lastPoint.x) ** 2 + (dot.y - __lastPoint.y) ** 2);

      if (distance > NEIGHBOUR_DISTANCE) {
        __lastPoint = dot;

        return true;
      }

      return false;
    },

    /**
     * update svg line. Lots of
     * @returns {void}
     */
    updatePath() {
      if (__dotsQueue.length === 0) {
        if (__recieveDrawInterval !== null) {
          clearInterval(__recieveDrawInterval);
          __recieveDrawInterval = null;
        }

        return;
      }
      const dot = { ...__dotsQueue.pop() };

      if (dot.rect) {
        __startRectPosition = {
          x: dot.x * __boardDimensions.width,
          y: dot.y * __boardDimensions.height,
        };

        return;
      }

      if (__startRectPosition === null) {
        if (this.checkNoNeighbour(dot) === false && __visibleDots.length > 1) {
          __visibleDots.pop();
        }
        __visibleDots.push([dot.x * __boardDimensions.width, dot.y * __boardDimensions.height]);
      }

      if (dot.end === true) {
        if (__startRectPosition) {
          this.completedPaths.push(this.currentRect());
          __startRectPosition = null;
        } else {
          this.completedPaths.push(this.currentPath());
          __visibleDots = [];
          __savedCurrentPath = '';
        }

        this.cursorCoords = null;
        this.startHidingSequence();
      } else {
        this.cursorCoords = dot;
      }
    },

    startHidingSequence() {
      this.$refs.svgPaths.classList.add('svg--hiding');
      __clearWhiteBoardTimeout = setTimeout(() => {
        this.completedPaths = [];
      }, TIME_BEFORE_CLEAR);
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
      if (__visibleDots.length === 0) {
        return;
      }
      const bezierCommandCalc = this.bezierCommand(this.controlPoint(this.line, SMOOTHING));
      const path = this.svgPath(__visibleDots, bezierCommandCalc);

      return path;
    },

    currentRect() {
      if (__startRectPosition === null || this.cursorCoords === null) {
        return '';
      }

      return `M${__startRectPosition.x},${__startRectPosition.y} ${this.cursorCoords.x * __boardDimensions.width},${__startRectPosition.y} ${this.cursorCoords.x * __boardDimensions.width},${this.cursorCoords.y * __boardDimensions.height} ${__startRectPosition.x},${this.cursorCoords.y * __boardDimensions.height} z`;
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
