<template>
  <div
    class="drawing-pad-container"
  >
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

/* throttle delay between saving dots */
const DELAY = 33;
/* throttle delay between sending dots */
const SEND_DELAY = 132;
const PERCENTAGE = 100;

/* variables for watching tablet size */
let __drawDimensions = {};
let __resizeObserver = {};

export default {
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
  },

  data() {
    return {
      // detect if mouse is clicked down
      isMouseDown: false,
      // stack of dots to push
      sendDots: [],
    };
  },

  computed: {
    /**
     * Style padding-bottom to match reciever screen's aspect ratio
     * @returns {object}
     */
    aspectRatioSize() {
      return {
        'padding-bottom': `${this.aspectRatio * PERCENTAGE}%`,
        width: `min(100%,${PERCENTAGE / this.aspectRatio}vh)`,
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
   * get relevant __drawDimensions by observing drawingPad element
   * @returns {void}
   */
  mounted() {
    const drawingPad = this.$refs.drawingPad;

    __resizeObserver = new ResizeObserver(this.watchDrawDimensions);
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
     * watcher for resizeObserver
     * @param {array} entries - resizeObserver entries
     * @returns {void}
     */
    watchDrawDimensions(entries) {
      for (const entry of entries) {
        this.setDrawDimensions(entry.target);
      }
    },

    /**
     * set dimensions for drawing pad
     * @param {object} target - drawing pad
     * @returns {void}
     */
    setDrawDimensions(target) {
      __drawDimensions = {
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
        x: $event.offsetX / __drawDimensions.width,
        y: $event.offsetY / __drawDimensions.height,
        time: $event.timeStamp,
        start: true,
        rect: $event.ctrlKey, // draw rect if ctrl key on mouseDown
      };

      this.sendDots.push(dot);
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
        x: $event.offsetX / __drawDimensions.width,
        y: $event.offsetY / __drawDimensions.height,
        time: $event.timeStamp,
        end: true,
      };

      this.sendDots.push(dot);
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
        x: $event.offsetX / __drawDimensions.width,
        y: $event.offsetY / __drawDimensions.height,
        time: $event.timeStamp,
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    }),

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
        dots: [ ...dots ],
        userId: this.myId,
      };

      this.sendDots = [];
      this.$emit('data', newDots);
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
    height 0
    width 100%
</style>
