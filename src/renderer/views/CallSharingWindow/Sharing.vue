<template>
  <div class="sharing-window">

    <div class="sharing-window__header">
      <span class="sharing-window__title">Sharing</span>
      <ui-button
        class="sharing-window__close"
        :type="10"
        size="small"
        icon="close">
      </ui-button>
    </div>

    <div class="sharing-window__content">

      <div class="sharing-window__options">
        <ui-button class="l-mr-8" :type="3" size="small">Screen</ui-button>
        <ui-button class="l-mr-8" :type="3" size="small">Camera</ui-button>
        <ui-button class="l-mr-8" :type="3" size="small">Screen and camera</ui-button>
        <ui-button class="l-mr-8" :type="3" size="small">Window</ui-button>
      </div>

    </div>

    <div class="sharing-window__footer">
      <ui-button class="l-mr-8" :type="1">Start sharing</ui-button>
      <ui-button class="l-mr-8" :type="12">Stop sharing</ui-button>
      <ui-button :type="8">Cancel</ui-button>
    </div>

  </div>
</template>

<script>
import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
  },
  computed: {
    mediaState() {
      return this.$store.getters['me/getMediaState'];
    },
  },
};
</script>

<style lang="stylus" scoped>
  .sharing-window
    display flex
    flex-direction column
    padding 20px
    height 100vh
    box-sizing border-box

    &__header
      display flex
      margin-bottom 16px
      align-items center

    &__close
      margin-left auto

    &__footer
      margin-top auto

</style>
