<template>
  <transition name="notification-fade">
    <div
      v-if="mounted"
      v-hammer:pan.horizontal="pan"
      v-hammer:panstart="onPanStart"
      v-hammer:panend="onPanEnd"
      :style="styles"
      class="notification"
    >
      <div class="notification__text">
        {{ data.text }}
      </div>
      <div class="notification__button-wrapper">
        <ui-button
          v-for="button in data.buttons"
          :key="button.text"
          :type="button.type || 8"
          size="small"
          class="notification__button"
          @click="clickHandler(button)"
        >
          {{ button.text }}
        </ui-button>
      </div>
    </div>
  </transition>
</template>

<script>
/* eslint-disable no-magic-numbers */
import UiButton from '@components/UiButton';
import Vue from 'vue';
import { VueHammer } from 'vue2-hammer';
Vue.use(VueHammer);
VueHammer.config.pan = {
  threshold: 10,
};

/* distance after which notification is concidered swiped out */
const TRESHOLD = 90;

/* distance that notification travels to the side during closing sequence */
const SIDETRAVEL = 100;

export default {

  components: {
    UiButton,
  },

  props: {
    /**
     * Unique id of notification
     */
    id: {
      type: String,
      required: true,
    },

    /**
      * Inner data with "text" and "buttons"
      * Buttons is an array with fields:
      * "text", "type", "action" (outer function to trigger),
      * and "close" (flag that shows we shoud close notification after clicking this button)
    */
    data: {
      type: Object,
      required: true,
    },

    /**
     * If the notification self-destructs after a certain amount of time
     */
    infinite: {
      type: Boolean,
      default: false,
    },

    /**
     * Time before self-destruct
     */
    lifespan: {
      type: Number,
      default: 10000,
    },

    /**
     * Prevent swiping logic
     */
    preventSwipe: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
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
   * 1. flag "mounted" to true (so we can show notification)
   * 2. emit "mounted" event (for future use)
   * 3. if notification is not infinite, set timeout with self-destruct
   *
   * @returns {void}
  */
  mounted() {
    this.mounted = true;
    this.$nextTick(() => {
      this.$emit('mounted', this.id);
    });

    if (!this.infinite) {
      setTimeout(() => {
        this.timeoutEnded = true;
        /* if we are holding the notification, or notification is already destroyed, do nothing */
        if (!this.holding && !this.closeRunning) {
          this.close();
        }
      }, this.lifespan);
    }
  },

  methods: {

    /**
     * Handle clicked button: strart closing sequence and trigger button action if found one
     *
     * @param {object} button – clicked button
     * @returns {void}
    */
    clickHandler(button) {
      if (button.action) {
        button.action();
      }
      this.close(true);
    },

    /**
     * Find and trigger default-close-button action
     *
     * @returns {void}
    */
    closeButtonAction() {
      if (this.data.buttons) {
        const cancelbutton = this.data.buttons.find(el => el.close);

        if (cancelbutton.action) {
          cancelbutton.action();
        }
      }
    },

    /**
     * Handle start of panning: remove transitions for smooth panning
     *
     * @param {object} event – hammer's event
     * @returns {void}
    */
    onPanStart(event) {
      if (this.preventSwipe) {
        return;
      }
      this.holding = true;
      this.styles.transition = 'all 0ms';
    },

    /**
     * Handle end of panning:
     * 1. Bring back transitions for smooth animations
     * 2. If we are over TRESHOLD, add fade-to-side-animation and trigger this.close
     *
     * @param {object} event – hammer's event
     * @returns {void}
    */
    onPanEnd(event) {
      if (this.preventSwipe) {
        return;
      }
      this.holding = false;
      this.styles.transition = null;

      /* if timer is present and over, close notificaton */
      if (this.timeoutEnded) {
        this.styles.opacity = 0;
        this.$nextTick(() => {
          this.close();
        });
      }

      const overTreshold = Math.abs(event.deltaX) > TRESHOLD;

      if (!overTreshold) {
        this.styles.transform = null;
        this.styles.opacity = null;
      } else {
        const target = event.deltaX + (event.deltaX > 0 ? SIDETRAVEL : -SIDETRAVEL);

        this.styles.transform = `translateX(${target}px)`;
        this.styles.opacity = 0;
        this.$nextTick(() => {
          this.close();
        });
      }
    },

    /**
     * Handle every panning event: translate notification and add opacity if over TRESHOLD
     *
     * @param {object} event – hammer's event
     * @returns {void}
    */
    pan(event) {
      if (this.preventSwipe) {
        return;
      }
      this.styles.transform = `translateX(${event.deltaX}px)`;

      const overTreshold = Math.abs(event.deltaX) > TRESHOLD;

      this.styles.opacity = overTreshold ? 0.5 : 1;
    },

    /**
     * Start removing the notification:
     * 1. If close sequence is already running, do nothing
     * 2. find button with "close" field set to true and trigger its action (if found)
     * 3. emit "close" event so that NotificationWrapper can remove this notification from store
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
      this.$emit('close', this.id);
    },

  },

};
</script>

<style lang="stylus" scoped>

$ANIM = 330ms
$ANIM_DELAY = 200ms

.notification
  background-color var(--app-bg)
  color var(--text-0)
  flex-shrink 0
  display flex
  flex-direction row
  justify-content space-between
  align-items flex-start
  padding 12px
  margin 0 12px 12px
  overflow hidden
  width calc(100% - 24px)
  height 60px // TODO: if notifications will be with auto height, we need to do js-height-calculation for smooth animations
  box-sizing border-box
  border-radius 6px
  box-shadow 0px 3px 8px rgba(0, 0, 0, 0.15)
  pointer-events auto
  transition all $ANIM ease
  opacity 1

  &__button-wrapper
    flex-shrink 0
    flex-grow 0
    margin-left 8px
    margin-bottom 12px

  &__button
    margin 0 4px

.notification-fade-enter
  opacity 0
  transform translateY(60px)
  margin-bottom -60px

.notification-fade-enter-to
  pointer-events none
  margin-bottom 12px
  transition opacity $ANIM ease $ANIM_DELAY, margin-bottom $ANIM ease, transform $ANIM ease

.notification-fade-leave
  margin-bottom 12px

.notification-fade-leave-to
  opacity 0
  transform translateY(60px)
  margin-bottom -60px
  transition opacity $ANIM ease, margin-bottom $ANIM ease $ANIM_DELAY, transform $ANIM ease

</style>
