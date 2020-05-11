<template>
  <div
    :style="$themes.getColors('popover')"
    class="notification-wrapper"
    :class="{'notification-wrapper--modal': isModal}"
  >
    <notification
      v-for="notif in notifications"
      :id="notif.id"
      :key="notif.id"
      :lifespan="notif.lifespan"
      :infinite="notif.infinite"
      :prevent-swipe="notif.preventSwipe"

      :data="notif.data"
      @close="closeHandler"
    />
  </div>
</template>

<script>
import Notification from './Notification';

export default {
  components: {
    Notification,
  },
  data() {
    return {

    };
  },
  computed: {
    /**
     * Get all notifications from store
     *
     * @returns {array}
    */
    notifications() {
      return this.$store.state.app.notifications;
    },

    /**
     * Get all notifications from store
     *
     * @returns {array}
    */
    isModal() {
      return !!this.notifications.find((el) => el.modal);
    },
  },
  methods: {
    /**
     * Close notification by its id
     *
     * @param {string} id id
     * @returns {void}
    */
    closeHandler(id) {
      this.$store.commit('app/REMOVE_NOTIFICATION', id);
    },
  },
};
</script>

<style lang="stylus" scoped>
.notification-wrapper
    position fixed
    width 100vw
    height 100vh
    pointer-events none
    display flex
    flex-direction column
    justify-content flex-end
    align-items center
    z-index 200
    background-color transparent
    transition background-color 0.5s ease

    &--modal
      pointer-events auto
      background-color rgba(255, 255, 255, 0.3)
</style>
