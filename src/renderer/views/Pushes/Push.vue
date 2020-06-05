<template>
  <transition name="push">
    <div
      v-if="mounted"
      v-hammer:pan.horizontal="pan"
      v-hammer:panstart="onPanStart"
      v-hammer:panend="onPanEnd"
      :style="styles"
      class="push"
    >
      <div class="push__content">
        <avatar
          class="push__avatar"
          :size="40"
          :image="user.avatar"
        />

        <div class="push__col">
          <p class="push__user-name">
            {{ user.name }}
          </p>

          <div
            v-if="data.channel"
            class="push__channel"
          >
            <span>{{ texts.invitesto }}</span>
            <svg-icon
              name="channelOnAir"
              size="medium"
              class="push__channel__icon"
            />
            <span v-textfade>{{ channel.name }}</span>
          </div>
          <div
            v-if="!data.channel"
            class="push__channel"
          >
            {{ texts.isbusy }}
          </div>
        </div>
      </div>
      <div class="push__button-wrapper">
        <ui-button
          v-for="button in buttons"
          :key="button.text"
          :type="button.type || 3"
          size="medium"
          class="push__button"
          @click="clickHandler(button)"
        >
          {{ button.text }}
        </ui-button>
      </div>
    </div>
  </transition>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import Vue from 'vue';
import { VueHammer } from 'vue2-hammer';
import { buttonTemplates } from './buttons';
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
    UiButton,
    Avatar,
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

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('push');
    },

    buttons() {
      return buttonTemplates[this.data.action] || null;
    },

    /**
     * Get user's info
     * @returns {object}
     */
    user() {
      return this.$store.getters['users/getUserById'](this.data.userId);
    },

    /**
     * Get user's channel
     * @return {object}
     */
    channel() {
      return this.$store.getters['channels/getChannelById'](this.data.channel) || { name: 'no channel' };
    },
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
     * @param {object} button – clicked button
     * @returns {void}
    */
    clickHandler(button) {
      if (button.response) {
        this.$emit('response', {
          response: button.response,
          messageId: this.data.messageId,
          data: this.data,
        });
      }
      this.close(true);
    },

    /**
     * Find and trigger default-close-button action
     *
     * @returns {void}
    */
    closeButtonAction() {
      if (this.buttons) {
        const cancelbutton = this.buttons.find(el => el.close);

        if (cancelbutton.response) {
          this.$emit('response', {
            response: cancelbutton.response,
            messageId: this.data.messageId,
            data: this.data,
          });
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

  &__content
    display flex

  &__col
      margin-left 8px

  &__avatar
    display block
    width 40px
    height 40px
    border-radius 4px
    flex-shrink 0

  &__user-name
    margin-top 3px
    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  &__channel
    display flex
    align-items center
    color var(--text-1)
    align-items center
    font-size 12px
    line-height 14px
    margin-top 1px
    flex-shrink 0
    white-space nowrap

    &__icon
      margin-left 4px

  &__button-wrapper
    flex-shrink 0
    flex-grow 0
    margin-left 8px

  &__button
    margin 0 4px

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
