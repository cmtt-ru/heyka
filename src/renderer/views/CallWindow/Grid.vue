<template>
  <div class="call-window">

    <div>Future grid with avatars</div>

    <call-controls :row="mediaState.screen"></call-controls>
  </div>
</template>

<script>
import CallControls from './CallControls';

export default {
  components: {
    CallControls,
  },
  computed: {
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },
  },
};
</script>

<style lang="stylus" scoped>
  .call-window
    display flex
    flex-direction column
    height 100vh

    &__media
      flex-grow 1

      video
        display block
        width 100%
        height 100%
        background #333

</style>
