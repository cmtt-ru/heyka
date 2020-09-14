<template>
  <div
    class="canvas-holder"
  >
    <svg
      ref="svgPaths"
      :viewBox="svgViewBox"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g :stroke="color">
        <path
          v-for="(path, index) in completedPaths"
          :key="index"
          class="svg-path"
          :d="path"
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

    <div
      ref="hightlight"
      class="click-highlight"
      :style="clickHighlightStyle"
    />
    <user-cursor
      v-show="local === false"
      ref="cursor"
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
const RECIEVE_DELAY = 70;
/* smoothing for svg lines */
const SMOOTHING = 0.2;
/* smallest distance between dots in svg line */
const NEIGHBOUR_DISTANCE = 0.005;
/* after this time of idling lines will dissappear (they'll start dissapearing at 70% of this time)*/
// TODO: unite this with css variable below in this file
const TIME_BEFORE_CLEAR = 5000;

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

    /**
     * drawing dimensions
     */
    boardDimensions: {
      type: Object,
      default: function () {
        return {
          width: 500,
          height: 400,
        };
      },
    },

    /**
     * true if board is for local client's drawing
     */
    local: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {

      isMouseDown: false,
      cursorCoords: null,
      highlightCoords: null,
      completedPaths: [],

      lastPoint: null,
      dotsQueue: [],
      recieveDrawInterval: null,
      clearWhiteBoardTimeout: null,
      startRectPosition: null,
      visibleDots: [],

    };
  },
  computed: {

    bufferDelay() {
      return this.local ? 0 : RECIEVE_DELAY;
    },
    /**
     * Position cursor
     * @returns {object}
     */
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
    /**
     * Position click animation
     * @returns {object}
     */
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
    /**
     * set viewbox for svg canvas
     * @returns {string}
     */
    svgViewBox() {
      return `0 0 ${this.boardDimensions.width || 0} ${this.boardDimensions.height || 0}`;
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
     *
     * @param {array} val - array with dots
     * @returns {void}
     */
    newDots(val) {
      this.addDots([ ...val ]);
    },

    /**
     * Delete all lines if board was resized
     *
     * @returns {void}
     */
    boardDimensions() {
      this.completedPaths = [];
      this.visibleDots = [];
    },
  },

  methods: {
    /**
     * Add new dots to local queue and trigger 'parseRecievedDots' after this.bufferDelay
     *
     * @param {array} incomeDots - array with dots
     * @returns {void}
     */
    addDots(incomeDots) {
      if (this.dotsQueue.length === 0) {
        this.dotsQueue = incomeDots.reverse();
      } else {
        this.dotsQueue = [...incomeDots.reverse(), ...this.dotsQueue];
      }
      setTimeout(() => {
        this.parseRecievedDots();
      }, this.bufferDelay);
    },

    /**
     * Parse new dots: start drawing line or moving cursor
     *
     * @returns {void}
     */
    parseRecievedDots() {
      if (this.dotsQueue.length === 0 || this.recieveDrawInterval !== null) {
        return;
      }
      try {
        this.$refs.cursor.$el.classList.remove('cursor--hiding');
      } finally {
        this.recieveDrawInterval = setInterval(() => {
          this.updatePath();
        }, DELAY);
      }
    },

    /**
     * HACK (sorry!) to make element reflow (and re-trigger its css animation)
     *
     * @param {object} el - element to reflow
     * @returns {void}
     */
    reflow(el) {
      if (!el) {
        return;
      }
      el.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight; /* trigger reflow */
      el.style.animation = null;
    },

    /**
     * move highlight animation to current coordinates and re-trigger animation (with the help of reflow)
     *
     * @param {object} dot - coords to move animation to
     * @returns {void}
     */
    highLightClick(dot) {
      this.highlightCoords = dot;
      this.reflow(this.$refs.hightlight);
    },

    /**
     * update svg line:
     * 1. Stop drawing if no dots
     * 2. Add dot to svg if not dot.end
     * 3. Gracefully end svg line if dot.end
     * 4. move cursor around
     *
     * @returns {void}
     */
    updatePath() {
      if (this.dotsQueue.length === 0) {
        try {
          this.$refs.cursor.$el.classList.add('cursor--hiding');
        } finally {
          clearInterval(this.recieveDrawInterval);
          this.recieveDrawInterval = null;
        }

        return;
      }
      const dot = { ...this.dotsQueue.pop() };

      if (dot.start === true) {
        clearTimeout(this.clearWhiteBoardTimeout);
        this.$refs.svgPaths.classList.remove('svg--hiding');
        this.isMouseDown = true;
      }
      this.addDotToSvg(dot);
      this.cursorCoords = dot;

      if (dot.end === true) {
        this.isMouseDown = false;
        this.finishSvg(dot);
      }
    },

    /**
     * check if distance between two last dots is bigger than NEIGHBOUR_DISTANCE
     *
     * @param {object} dot - current dot position
     * @returns {boolean} true if no nearby dots
     */
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

    /**
     * Add dot to svg:
     * 1. start rectangle if dot.rect
     * 2. pop last dot if we are still too close to last dot
     * 3. push dot to svg line dots' array
     *
     * @param {object} dot - current dot
     * @returns {void}
     */
    addDotToSvg(dot) {
      if (this.isMouseDown == false) {
        return;
      }
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
    },

    /**
     * Finish svg, rect or line
     *
     * @param {object} dot - last dot
     * @returns {void}
     */
    finishSvg(dot) {
      if (this.startRectPosition) {
        this.completedPaths.push(this.currentRect());
        this.startRectPosition = null;
      } else {
        if (this.visibleDots.length > 2) {
          this.completedPaths.push(this.currentPath());
        } else { // consider this a click
          this.highLightClick(dot);
        }

        this.visibleDots = [];
      }

      // this.cursorCoords = null;
      this.startHidingSequence();
    },

    /**
     * Start timeout for hiding and deleting all svg lines
     *
     * @returns {void}
     */
    startHidingSequence() {
      try {
        this.$refs.svgPaths.classList.add('svg--hiding');
      } finally {
        this.clearWhiteBoardTimeout = setTimeout(() => {
          this.completedPaths = [];
        }, TIME_BEFORE_CLEAR);
      }
    },

    /**
     * Get current svg path
     *
     * @returns {string}
     */
    currentPath() {
      if (this.visibleDots.length === 0) {
        return;
      }
      const bezierCommandCalc = this.bezierCommand(this.controlPoint(this.line, SMOOTHING));
      const path = this.svgPath(this.visibleDots, bezierCommandCalc);

      return path;
    },

    /**
     * Get current svg rect (also path)
     *
     * @returns {string}
     */
    currentRect() {
      if (this.startRectPosition === null || this.cursorCoords === null) {
        return;
      }

      return `M${this.startRectPosition.x},${this.startRectPosition.y} ${this.cursorCoords.x * this.boardDimensions.width},${this.startRectPosition.y} ${this.cursorCoords.x * this.boardDimensions.width},${this.cursorCoords.y * this.boardDimensions.height} ${this.startRectPosition.x},${this.cursorCoords.y * this.boardDimensions.height} z`;
    },

    // !
    // BEZIER CALCULATIONS. MATHS AHEAD!
    // !

    /**
     * Get a bezier curve before passed point.
     *
     * @param {function} pointsArr - array with dots in svg path
     * @param {function} command - command that calculates bezier curve before specific dot
     *
     * @returns {string} full svg path
     */
    svgPath(pointsArr, command) {
      if (typeof this.svgPath.savedCurrentLength == 'undefined') {
        this.svgPath.savedCurrentLength = 0;
        this.svgPath.savedCurrentPath = '';
      }

      const length = pointsArr.length;
      const minSaveLength = 4;

      if (length === 0) {
        this.svgPath.savedCurrentPath = '';
      } else if (length < minSaveLength) {
        return pointsArr.reduce((acc, e, i, a) => i === 0
          ? `M ${e[0]},${e[1]}`
          : `${acc} ${command(e, i, a)}`
        , '');
      } else if (length === minSaveLength) {
        this.svgPath.savedCurrentLength = minSaveLength;
        this.svgPath.savedCurrentPath = `M ${pointsArr[0][0]},${pointsArr[0][1]} ${command(pointsArr[1], 1, pointsArr)}`;

        return pointsArr.reduce((acc, e, i, a) => i === 0
          ? `M ${e[0]},${e[1]}`
          : `${acc} ${command(e, i, a)}`
        , ''); ;
      }
      // eslint-disable-next-line no-magic-numbers
      const fiveLastDots = pointsArr.slice(-5);

      if (this.svgPath.savedCurrentLength !== length) {
        this.svgPath.savedCurrentPath += command(fiveLastDots[2], 2, fiveLastDots);
        this.svgPath.savedCurrentLength = length;
      }

      // eslint-disable-next-line no-magic-numbers
      return this.svgPath.savedCurrentPath + command(fiveLastDots[3], 3, fiveLastDots) + command(fiveLastDots[4], 4, fiveLastDots);
    },

    /**
     * Get distance between two dots, and slope
     *
     * @param {array} pointA - first dot, [x, y]
     * @param {array} pointB - second dot, [x, y]
     * @returns {object} {length, angle}
     */
    line: (pointA, pointB) => {
      const lengthX = pointB[0] - pointA[0];
      const lengthY = pointB[1] - pointA[1];

      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
      };
    },

    /**
     * Get a control point for one side of bezier curve. Need neigbour dots for smooth curving
     *
     * @param {function} line - function to get slope and distance between two dots
     * @param {number} smooth - how smooth must bezier curve be. best between 0.1 and 0.25
     *
     * @param {array} current - [x,y] current dot
     * @param {array} previous - [x,y] previous dot
     * @param {array} next - [x,y] next dot
     * @param {boolean} reverse - true if control point is on the end point of curve
     * @returns {array} [x,y] for control point
     */
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

    /**
     * Get a bezier curve before passed point.
     *
     * @param {function} controlPoint - function to get control points
     *
     * @param {array} point - [x,y] current dot
     * @param {number} index - index of passed point in array
     * @param {array} arr - array of doys in svg
     * @returns {string} bezier curve: 'C p1x p1y p2x p2y x y'
     */
    bezierCommand: (controlPoint) => (point, index, arr) => {
      const cps = controlPoint(arr[index - 1], arr[index - 2], point);
      const cpe = controlPoint(point, arr[index - 1], arr[index + 1], true);

      return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]} `;
    },

  },

};
</script>

<style lang="stylus" scoped>

$SVG_HIDE_TIME = 5s
$CURSOR_HIDE_TIME = 2s
$CLICK_ANIM_TIME = 0.7s

.svg-path
    fill transparent
    stroke-width 4px
    stroke-opacity 1
    stroke-linecap round

.svg--hiding
    animation $SVG_HIDE_TIME 1 forwards svgClear

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
.cursor
    position absolute
    top 0
    left 0

    &--hiding
      animation $CURSOR_HIDE_TIME 1 forwards HideCursor

@keyframes HideCursor {
  0% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }

}
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
    animation $CLICK_ANIM_TIME 1 forwards click;

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
