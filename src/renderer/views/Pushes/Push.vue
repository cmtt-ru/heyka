<template>
  <transition name="push">
    <component
      :is="data.action"
      v-if="mounted"
      v-hammer:pan.horizontal="pan"
      v-hammer:panstart="onPanStart"
      v-hammer:panend="onPanEnd"
      :style="styles"
      class="push"
      :data="data"
      @buttonClick="clickHandler"
      @defaultCloseResponse="saveCloseResponse"
    />
  </transition>
</template>

<script>
import Vue from 'vue';
import { VueHammer } from 'vue2-hammer';
Vue.use(VueHammer);
VueHammer.config.pan = {
  threshold: 10,
};

/* distance after which push is concidered swiped out */
const THRESHOLD = 90;

/* distance that push travels to the side during closing sequence */
const SIDETRAVEL = 100;

export default {

  components: {
    invite: () => import('./Templates/Invite'),
    busy: () => import('./Templates/Busy'),
  },

  props: {
    /**
     * Unique id of push
     */
    id: {
      type: String,
      required: true,
    },

    /**
      * Inner data with "user", "channel" and "buttons"
      * Buttons is an array with fields:
      * "text", "type", "response",
      * and "close" (flag that shows we shoud close push after clicking this button)
    */
    data: {
      type: Object,
      required: true,
    },

    /**
     * Time before self-destruct
     */
    lifespan: {
      type: Number,
      default: 40000,
    },
  },

  data() {
    return {
      closeResponse: null,
      mounted: false,
      holding: false,
      timeoutEnded: false,
      closeRunning: false,
      styles: {
        transition: null,
        opacity: null,
        transform: null,
        height: null,
        padding: null,
        margin: null,
      },
    };
  },

  /**
   * 1. flag "mounted" to true (so we can show push)
   * 2. emit "mounted" event (for future use)
   * 3. set timeout with self-destruct
   *
   * @returns {void}
  */
  mounted() {
    this.mounted = true;
    this.$nextTick(() => {
      this.$emit('mounted', this.id);
    });

    setTimeout(() => {
      this.timeoutEnded = true;
      /* if we are holding the push, or push is already destroyed, do nothing */
      if (!this.holding && !this.closeRunning) {
        this.close(true);
      }
    }, this.lifespan);
  },

  methods: {

    /**
     * Handle clicked button: strart closing sequence and trigger button action if found one
     *
     * @param {object} response – response
     * @returns {void}
    */
    clickHandler(response) {
      if (response) {
        this.$emit('response', {
          response,
          messageId: this.data.messageId,
          data: this.data,
        });
      }
      this.close(true);
    },

    /**
     * Save default-close-button response
     *
     * @param {object} response – default-close-button response
     * @returns {void}
    */
    saveCloseResponse(response) {
      this.closeResponse = response;
    },

    /**
     * Trigger default-close-button response
     *
     * @returns {void}
    */
    closeButtonAction() {
      if (this.closeResponse) {
        this.$emit('response', {
          response: this.closeResponse,
          messageId: this.data.messageId,
          data: this.data,
        });
      }
    },

    /**
     * Handle start of panning: remove transitions for smooth panning
     *
     * @param {object} event – hammer's event
     * @returns {void}
    */
    onPanStart(event) {
      this.holding = true;
      this.styles.opacity = 1;
      this.styles.transition = 'all 0ms';
    },

    /**
     * Handle end of panning:
     * 1. Bring back transitions for smooth animations
     * 2. If we are over THRESHOLD, add fade-to-side-animation and trigger this.close
     *
     * @param {object} event – hammer's event
     * @returns {void}
    */
    onPanEnd(event) {
      this.holding = false;
      this.styles.transition = null;

      /* if timer is present and over, close push */
      if (this.timeoutEnded) {
        this.styles.opacity = 0;
        this.$nextTick(() => {
          this.close(true);
        });
      }

      const overThreshold = event.deltaX > THRESHOLD;

      if (!overThreshold) {
        this.styles.transform = null;
        this.styles.opacity = null;
      } else {
        const target = event.deltaX + SIDETRAVEL;

        this.styles.transform = `translateX(${target}px)`;
        this.styles.opacity = 0;
        this.$nextTick(() => {
          this.close();
        });
      }
    },

    /**
     * Handle every panning event: translate push and add opacity if over THRESHOLD
     *
     * @param {object} event – hammer's event
     * @returns {void}
    */
    pan(event) {
      if (event.deltaX > 0) {
        this.styles.transform = `translateX(${event.deltaX}px)`;
      } else {
        this.styles.transform = `translateX(0px)`;
      }
    },

    /**
     * Start removing the push:
     * 1. If close sequence is already running, do nothing
     * 2. find button with "close" field set to true and trigger its action (if found)
     * 3. emit "close" event so that pushWrapper can remove this push from store
     *
     * @param {boolean} clicked true if this function was called after clicking the button
     * @returns {void}
    */
    close(clicked) {
      if (this.closeRunning) {
        return false;
      } else {
        this.closeRunning = true;
      }
      if (!clicked) {
        this.closeButtonAction();
      }
      this.$emit('close', this.data.messageId);
    },

  },

};
</script>

<style lang="stylus" scoped>

$ANIM = 330ms
$ANIM_DELAY = 200ms

.push
  background-color var(--app-bg)
  color var(--text-0)
  flex-shrink 0
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  padding 12px
  margin 0 12px 12px
  overflow hidden
  width 344px
  height 64px
  box-sizing border-box
  border-radius 6px
  box-shadow 0px 3px 8px rgba(0, 0, 0, 0.15)
  pointer-events auto
  transition all $ANIM ease
  opacity 1

.push-enter
  height 0
  padding 0px 12px
  margin 0px 12px
  opacity 0
  transform translateX(200px)

.push-enter-active
  pointer-events none
  transition opacity $ANIM ease $ANIM_DELAY, height $ANIM ease, padding $ANIM ease, margin $ANIM ease, transform $ANIM ease $ANIM_DELAY

.push-leave
  height 0
  opacity 0

.push-leave-active
  padding 0px 12px
  margin 0px 12px
  opacity 0
  height 0
  transition opacity $ANIM ease, height $ANIM ease $ANIM_DELAY, padding $ANIM ease $ANIM_DELAY, margin $ANIM ease $ANIM_DELAY, transform $ANIM ease

</style>
