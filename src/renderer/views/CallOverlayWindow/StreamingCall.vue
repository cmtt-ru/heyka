<template>
  <div class="call-window">
    <div
      class="sharing-panel"
    >
      <transition
        :name="transitionName"
        mode="out-in"
      >
        <svg-icon
          :key="headerIcon"
          class="sharing-panel__enter-icon"
          :name="headerIcon"
          :height="24"
          :width="24"
        />
      </transition>
      <div
        v-textfade
        class="sharing-panel__header"
      >
        <transition
          :name="transitionName"
          mode="out-in"
        >
          <span :key="headerText">{{ headerText }}</span>
        </transition>
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
import { mapGetters } from 'vuex';

const LAST_USER_INTERVAL = 4000;
let lastUserTimer = null;

export default {
  components: {
    CallControls,
    UiButton,
  },

  data() {
    return {
      streamingOverlayExpanded: true,
      isMediaPlaying: false,
      headerText: this.$t('call.sharing.ongoingSharing'),
      headerIcon: '',
      transitionName: 'none',
    };
  },

  computed: {
    ...mapGetters({
      myId: 'me/getMyId',
      selectedChannel: 'myChannel',
      userById: 'users/getUserById',
    }),

    userIdsInChannel() {
      return this.selectedChannel?.users.map(el => el.userId);
    },

    /**
     * Last user in channel
     * @returns {object|boolean}
     */
    enteredUser() {
      if (this.selectedChannel && this.selectedChannel.users.length > 0) {
        return this.selectedChannel.users[this.selectedChannel.users.length - 1].userId;
      }

      return false;
    },
  },

  watch: {
    userIdsInChannel(newVal, oldVal) {
      if (newVal.length < oldVal.length) {
        const leftUser = oldVal.find((el, index) => el !== newVal[index]);

        this.changeHeader(this.userById(leftUser).name, 'disconnect');
      }
    },

    enteredUser(newVal) {
      if (!newVal) {
        return;
      }

      if (this.myId !== newVal) {
        this.changeHeader(this.userById(newVal).name, 'connect');
      }
    },

  },

  mounted() {
    setTimeout(() => {
      this.enableTransitions();
    }, LAST_USER_INTERVAL);
  },

  methods: {

    streamingHandler() {
      this.streamingOverlayExpanded = !this.streamingOverlayExpanded;
      broadcastEvents.dispatch('click-streaming-panel', this.streamingOverlayExpanded);
    },

    changeHeader(text, icon) {
      this.headerText = text;
      this.headerIcon = icon;

      clearTimeout(lastUserTimer);

      lastUserTimer = setTimeout(() => {
        this.headerText = this.$t('call.sharing.ongoingSharing');
        this.headerIcon = '';
      }, LAST_USER_INTERVAL);
    },

    /**
     * Enable transitions
     * @returns {void}
     */
    enableTransitions() {
      this.transitionName = 'fade';
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
  justify-content space-between
  align-items center

  &__enter-icon
    flex-shrink 0
    margin-right 8px
    opacity 0.5

  &__header
    text-align center
    pointer-events none

  &__expand-button
    border-radius 20px
    overflow hidden
    flex-shrink 0
    margin-left 8px
    background-color rgba(255, 255, 255, 0.2) //! не переменная

  .fade-enter-active,
  .fade-leave-active
    transition all 0.25s

  .fade-enter,
  .fade-leave-to
    opacity 0

</style>
