<template>
  <div
    class="drawing-pad-container"
  >
    <board
      v-if="myDrawing"
      class="my-drawing"
      :style="aspectRatioSize"
      local
      :income-data="localdata"
      :board-dimensions="drawDimensions"
    />
    <div
      ref="drawingPad"
      class="drawing-pad"
      :style="aspectRatioSize"
      @mousemove="mouseMoveHandler"
      @mousedown="mouseDownHandler"
      @mouseup="mouseUpHandler"
      @mouseleave="mouseUpHandler"
    />
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce';
import Board from '@components/Drawing/Board';

/* throttle delay between saving dots */
const DELAY = 33;
/* throttle delay between sending dots */
const SEND_DELAY = 132;
const PERCENTAGE = 100;

/* variables for watching tablet size */
let __resizeObserver = {};

export default {
  components: {
    Board,
  },
  props: {
    /**
     * sender's Id (ours)
     */
    myId: {
      type: String,
      default: '',
    },
    /**
     * screen's aspect ratio
     */
    aspectRatio: {
      type: Number,
      default: 1,
    },
    /**
     * Color of line, arrow and box
     */
    color: {
      type: String,
      default: '#000',
    },
    /**
     * If we should display our drawings
     */
    myDrawing: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      // detect if mouse is clicked down
      isMouseDown: false,
      // stack of dots to push
      sendDots: [],
      drawDimensions: {},
      lastDot: {},
    };
  },

  computed: {
    localdata() {
      return {
        color: this.color,
        dots: [ this.lastDot ],
      };
    },
    /**
     * Style padding-bottom to match reciever screen's aspect ratio
     * @returns {object}
     */
    aspectRatioSize() {
      return {
        width: `min(100%,${PERCENTAGE / this.aspectRatio}vh)`,
        height: `min(100%,${PERCENTAGE * this.aspectRatio}vw)`,

      };
    },

  },

  watch: {
    aspectRatio() {
      this.$nextTick(() => {
        const drawingPad = this.$refs.drawingPad;

        this.setDrawDimensions(drawingPad);
      });
    },
  },

  /**
   * get relevant drawDimensions by observing drawingPad element
   * @returns {void}
   */
  mounted() {
    const drawingPad = this.$refs.drawingPad;

    __resizeObserver = new ResizeObserver(this.setDrawDimensions);
    __resizeObserver.observe(drawingPad);
  },

  /**
   * unsubscribe from resizeObserver
   * @returns {void}
   */
  beforeDestroy() {
    const drawingPad = this.$refs.drawingPad;

    __resizeObserver.unobserve(drawingPad);
  },

  methods: {

    /**
     * set dimensions for drawing pad
     * @returns {void}
     */
    setDrawDimensions() {
      const target = this.$refs.drawingPad;

      this.drawDimensions = {
        width: target.offsetWidth,
        height: target.offsetHeight,
      };
    },

    /**
     * handle mouse down event: start a line or initiate clicking animation
     * @param {object} $event - MouseEvent
     * @returns {void}
     */
    mouseDownHandler($event) {
      this.isMouseDown = true;
      const dot = {
        x: $event.offsetX / this.drawDimensions.width,
        y: $event.offsetY / this.drawDimensions.height,
        time: $event.timeStamp,
        start: true,
        rect: $event.ctrlKey, // draw rect if ctrl key on mouseDown
      };

      this.addDot(dot);
      this.throttleSendDots();
    },

    /**
     * handle mouse up event: end a line
     * @param {object} $event - MouseEvent
     * @returns {void}
     */
    mouseUpHandler($event) {
      if (this.isMouseDown === false) {
        return;
      }
      this.isMouseDown = false;
      const dot = {
        x: $event.offsetX / this.drawDimensions.width,
        y: $event.offsetY / this.drawDimensions.height,
        time: $event.timeStamp,
        end: true,
      };

      this.addDot(dot);
      this.emitDots(this.sendDots);
      this.lastPoint = null;
    },

    /**
     * handle mouse move event: draw a line, move cursor
     * @param {object} $event - MouseEvent
     * @returns {void}
     */
    mouseMoveHandler: throttle(DELAY, false, function ($event) {
      // if (this.isMouseDown === false && this.drawingMode === true) {
      //   return;
      // }
      const dot = {
        x: $event.offsetX / this.drawDimensions.width,
        y: $event.offsetY / this.drawDimensions.height,
        time: $event.timeStamp,
      };

      this.addDot(dot);
      this.throttleSendDots();
    }),

    addDot(dot) {
      this.sendDots.push(dot);
      if (this.myDrawing) {
        this.lastDot = dot;
      }
    },

    /**
     * Throttle sending dots by sending them only every SEND_DELAY ms
     * @returns {void}
     */
    throttleSendDots: throttle(SEND_DELAY, false, function () {
      this.emitDots(this.sendDots);
    }),

    /**
     * Make a fancy object with dots and other useful info
     * and emit it to the parent
     * @param {array} dots - array of dots gathered in last SEND_DELAY ms
     * @returns {void}
     */
    emitDots(dots) {
      if (dots.length < 2 && dots[dots.length - 1]?.end !== true) {
        return;
      }
      const newDots = {
        color: this.color,
        dots: dots,
        userId: this.myId,
      };

      this.$emit('data', newDots);
      this.sendDots = [];
    },
  },
};
</script>

<style lang="stylus" scoped>
.drawing-pad-container
    position relative
    width 100%
    height 100%
    display flex
    align-items center
    justify-content center
    box-sizing border-box
.drawing-pad
    overflow hidden
    height 100%
    width 100%

.my-drawing
  position absolute
  top 0
  bottom 0
  left 0
  right 0
  margin auto
  height 100%
  width 100%
  pointer-events none
</style>
