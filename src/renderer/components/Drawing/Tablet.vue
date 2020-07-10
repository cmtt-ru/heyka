<template>
  <div>
    <div
      ref="drawingPad"
      class="drawing-pad-container"
      @mousemove="mouseMoveHandler"
      @mousedown="mouseDownHandler"
      @mouseup="mouseUpHandler"
      @mouseleave="mouseUpHandler"
    >
      <div

        class="drawing-pad aspect-ratio"
      />
    </div>

    <ui-switch
      v-model="drawingMode"
      text="Режим рисования"
    />
  </div>
</template>

<script>
import { UiSwitch } from '@components/Form';
import { throttle } from 'throttle-debounce';

const DELAY = 33;
const SEND_DELAY = 250;

export default {
  components: {
    UiSwitch,
  },
  props: {
    /**
     * sender's Id (our)
     */
    myId: {
      type: String,
      default: '',
    },
    /**
     * reciever Id
     */
    recieverId: {
      type: String,
      default: '',
    },
    /**
     * Color of arrow & box
     */
    color: {
      type: String,
      default: '#000',
    },
  },
  data() {
    return {
      drawingMode: false,
      drawDimensions: {},
      isMouseDown: false,
      sendDots: [],
      newDots: {},
    };
  },
  mounted() {
    const drawingPad = this.$refs.drawingPad;
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
        rect: $event.ctrlKey,
      };

      this.sendDots.push(dot);
      this.throttleSendDots();
    },
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

      this.sendDots.push(dot);
      this.sendDotsAPI(this.sendDots);
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

    throttleSendDots: throttle(SEND_DELAY, false, function () {
      this.sendDotsAPI(this.sendDots);
    }),

    sendDotsAPI(dots) {
      if (dots.length > 1 || this.drawingMode === true) {
        this.newDots = {
          color: this.color,
          drawing: this.drawingMode,
          dots: [ ...dots ],
          userId: this.myId,
        }; // TODO: toggle API here
        this.sendDots = [];
        this.$emit('data', this.newDots);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
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
</style>
