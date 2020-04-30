<template>
  <div :style="$themes.getColors('popover')" class="notification-wrapper">
      <notification :data="notif" v-for="notif in notifications" :key="notif.id"/>
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
      notifications: this.$store.state.app.notifications,
    };
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
    z-index 1000
</style>
