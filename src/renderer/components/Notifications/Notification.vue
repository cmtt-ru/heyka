<template>
    <div v-hammer:pan.horizontal="pan" v-hammer:panstart="onPanStart" v-hammer:panend="onPanEnd" ref="notification" :style="cStyles" class="notification">{{data.text}}<br>{{holding}}</div>
</template>

<script>
/* eslint-disable no-magic-numbers */
import Vue from 'vue';
import { VueHammer } from 'vue2-hammer';
Vue.use(VueHammer);
VueHammer.config.pan = {
  threshold: 10,
};

export default {

  props: {
    data: {
      type: Object,
    },
  },

  data() {
    return {
      notificationsss: this.$store.state.app.notifications,
      notifications: [],
      transition: 330,
      timeout: 20000,
      marginY: 10,
      marginX: 20,
      opacity: 1,
      tempTransition: null,
      preventClose: false,
      treshold: 90,
      holding: false,
      timeoutEnded: false,
      closeRunning: false,
      position: 'bottom center',
      appear: {
        'top left': 'NotifyFromLeft',
        'top right': 'NotifyFromRight',
        'top center': 'NotifyFromTop',
        'bottom left': 'NotifyFromLeft',
        'bottom right': 'NotifyFromRight',
        'bottom center': 'NotifyFromBottom',
      },
      styles: {
        transition: null,
        opacity: null,
        left: null,
        right: null,
        top: null,
        bottom: null,
        transform: null,
        animation: null,
        pointerEvents: null,
      },
      lastTimes: [],
    };
  },

  computed: {
    ypos() {
      return this.position.split(' ')[0];
    },
    center() {
      return `calc(50vw - ${(this.$el.clientWidth / 2)}px)`;
    },
    cStyles() {
      const styles = Object.assign({}, this.styles);

      for (const key in styles) {
        // eslint-disable-next-line no-prototype-builtins
        if (styles.hasOwnProperty(key) && key != 'opacity' && typeof styles[key] == 'number') {
          styles[key] = styles[key] + 'px';
        }
      }

      return styles;
    },
  },
  methods: {
    onPanStart(event) {
      console.log('pan start');
      this.holding = true;
      this.tempTransition = this.styles.transition;
      this.styles.transition = null;
    },
    onPanEnd(event) {
      console.log('pan end');
      this.holding = false;
      const overTreshold = Math.abs(event.deltaX) > this.treshold;

      this.styles.transition = this.tempTransition;
      this.tempTransition = null;
      if (this.timeoutEnded) {
        this.close();
      }
      if (overTreshold) {
        const target = event.deltaX + (event.deltaX > 0 ? 100 : -100);

        this.styles.transform = `translateX(${(this.close() ? target : 0)}px)`;
      } else {
        this.styles.transform = null;
      }
    },
    pan(event) {
      const overTreshold = Math.abs(event.deltaX) > this.treshold;

      this.styles.transform = `translateX(${event.deltaX}px)`;
      this.styles.opacity = overTreshold ? 0.5 : this.opacity;
    },
    startingPos() {
      const pos = {};
      const yx = this.position.split(' ');
      const x = yx[1] === 'center' ? 'left' : yx[1]; // x = left or right
      const y = yx[0]; //  y = top or bottom

      pos[y] = this.marginY;
      pos[x] = yx[1] === 'center' ? this.center : this.marginX;

      return pos;
    },
    close(forced) {
      console.log('closed');

      if (this.closeRunning) {
        return false;
      } else {
        this.closeRunning = true;
      }
      // this.fire('before-close', this);
      if (!forced && this.preventClose) {
        this.preventClose = this.closeRunning = false;

        return false;
      }
      this.styles.opacity = 0;
      this.styles.pointerEvents = 'none';
      setTimeout(() => {
        this.$destroy();
        this.$el.remove();
        // this.fire('destroyed', this);
      }, this.transition);

      return true;
    },
  },

  mounted() {
    this.styles.transition = `all ${this.transition}ms ease`;
    this.styles.opacity = 0;
    // this.mounted = true;
    this.$nextTick(() => {
      // this.fire('mounted', this)
      this.styles.opacity = this.opacity;
      this.styles.animation = `${this.appear[this.position]} ${this.transition}ms forwards`;
      setTimeout(() => {
        this.styles.animation = null;
      }, this.transition);
      Object.assign(this.styles, this.startingPos());
      this.notifications
        .filter(item => item.position == this.position)
        .forEach(item => {
          item.styles[this.ypos] += this.$el.clientHeight + this.marginY;
        });
    });

    if (this.timeout && this.timeout > 0) {
      setTimeout(() => {
        this.timeoutEnded = true;
        if (!this.holding) {
          this.close();
        }
      }, this.timeout);
    }
  },
};
</script>

<style lang="stylus" scoped>
.notification
    pointer-events all
    background-color var(--app-bg)
    color var(--text-0)
    display flex
    flex-direction row
    justify-content space-around
    align-items center
    padding 20px
    margin 0 8px 8px
    width 50%
    box-sizing border-box
    border-radius 6px
    box-shadow 0px 3px 8px rgba(0, 0, 0, 0.15)

@keyframes NotifyFromLeft {
  from {
    transform: translateX(-100%)
  }
  to {
    transform: translateX(0%)
  }
}
@keyframes NotifyFromRight {
  from {
    transform: translateX(100%)
  }
  to {
    transform: translateX(0%)
  }
}
@keyframes NotifyFromTop {
  from {
    transform: translateY(-100%)
  }
  to {
    transform: translateY(0%)
  }
}
@keyframes NotifyFromBottom {
  from {
    transform: translateY(100%)
  }
  to {
    transform: translateY(0%)
  }
}
</style>
