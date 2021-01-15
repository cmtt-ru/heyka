<template>
  <transition :name="transitionName">
    <component
      :is="data.action"
      v-if="mounted"
      ref="push"
      v-hammer:pan.horizontal="pan"
      v-hammer:panstart="onPanStart"
      v-hammer:panend="onPanEnd"
      :style="styles"
      class="push"
      :data="data"
      @child-mounted="childMountedHandler"
      @button-click="clickHandler"
      @default-close-response="saveCloseResponse"
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

const DEFAULT_HEIGHT = 100;

export default {

  components: {
    invite: () => import('./Templates/Invite'),
    busy: () => import('./Templates/Busy'),
    muted: () => import('./Templates/Muted'),
    mutedForAll: () => import('./Templates/MutedForAll'),
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
      transitionName: null,
      closeResponse: null,
      mounted: false,
      childMounted: false,
      holding: false,
      timeoutEnded: false,
      closeRunning: false,
      styles: {
        transition: null,
        opacity: 0,
        transform: null,
        height: null,
        padding: null,
        margin: null,
        position: 'absolute',
        '--offset': '-66px',
        'pointer-events': 'none',
      },
    };
  },

  mounted() {
    this.mounted = true;
  },

  methods: {
    /**
     * 1. flag "mounted" to true (so we can show push)
     * 2. emit "mounted" event (for future use)
     * 3. set timeout with self-destruct
     *
     * @returns {void}
    */
    childMountedHandler() {
      if (this.childMounted) {
        return;
      }
      this.childMounted = true;
      this.styles['--offset'] = `-${this.$refs.push?.$el?.offsetHeight || DEFAULT_HEIGHT}px`;
      this.styles.position = null;
      this.styles.opacity = null;
      this.styles['pointer-events'] = null;
      this.mounted = false;
      this.transitionName = 'push';
      this.$emit('mounted', this.id);
      this.$nextTick(() => {
        this.mounted = true;
      });

      setTimeout(() => {
        this.timeoutEnded = true;
        /* if we are holding the push, or push is already destroyed, do nothing */
        if (!this.holding && !this.closeRunning) {
          this.close(true);
        }
      }, this.lifespan);
    },

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
          inviteId: this.data.inviteId,
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
          inviteId: this.data.inviteId,
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
      this.$emit('close', this.data.inviteId);
    },

  },

};
</script>

<style lang="stylus" scoped>

$ANIM = 330ms
$ANIM_DELAY = 200ms

.push
  background-color var(--new-bg-04)
  color var(--new-UI-02)
  flex-shrink 0
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  padding 12px
  margin-bottom 12px
  overflow hidden
  width 344px
  box-sizing border-box
  border-radius 12px
  box-shadow 0px 3px 8px rgba(0, 0, 0, 0.15)
  pointer-events auto
  transition all $ANIM ease
  opacity 1

.push-enter
  opacity 0
  transform translateX(200px)
  margin-bottom var(--offset)

.push-enter-to
  pointer-events none
  margin-bottom 12px
  transition opacity $ANIM ease $ANIM_DELAY, margin-bottom $ANIM ease, transform $ANIM ease $ANIM_DELAY

.push-leave
  opacity 0
  margin-bottom 12px

.push-leave-to
  opacity 0
  margin-bottom var(--offset)
  transform translateY(var(--offset))
  transition opacity $ANIM ease, margin-bottom $ANIM ease, transform $ANIM ease

</style>
