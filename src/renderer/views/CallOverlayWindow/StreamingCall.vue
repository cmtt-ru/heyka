<template>
  <div class="call-window">
    <div
      class="sharing-panel"
    >
      <div class="sharing-panel__header">
        {{ $t('call.sharing.ongoingSharing') }}
      </div>
      <ui-button
        :type="7"
        square
        popover
        class="sharing-panel__expand-button"
        size="small"
        :icon="streamingOverlayExpanded ? 'collapse': 'arrow-down'"
        @click="streamingHandler"
      />
    </div>

    <call-controls
      :row="true"
      :buttons="['screen', 'microphone', 'drawing', 'grid', 'leave']"
      class="call-window__controls"
    />
  </div>
</template>

<script>
import CallControls from '@sdk/views/Call/CallControls';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import UiButton from '@components/UiButton';

export default {
  components: {
    CallControls,
    UiButton,
  },
  data() {
    return {
      streamingOverlayExpanded: false,
      isMediaPlaying: false,
    };
  },

  methods: {
    streamingHandler() {
      this.streamingOverlayExpanded = !this.streamingOverlayExpanded;
      broadcastEvents.dispatch('hover-streaming-panel', this.streamingOverlayExpanded);
    },

  },
};
</script>

<style lang="stylus" scoped>

.sharing-panel
  position relative
  background-color var(--new-UI-01)
  color var(--new-UI-09)
  width 100%
  height 42px
  flex-shrink 0
  padding 8px
  box-sizing border-box
  display flex
  flex-direction row
  justify-content flex-end
  align-items center

  &__header
    position absolute
    left 0
    right 0
    text-align center
    pointer-events none

  &__expand-button
    border-radius 20px
    overflow hidden
    background-color rgba(255, 255, 255, 0.2) //! не переменная

</style>
