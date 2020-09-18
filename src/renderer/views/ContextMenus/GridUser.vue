<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        data-popover-close
        @click="muteClickHandler"
      >
        {{ texts.mute }}
      </ui-button>
      <ui-button
        v-if="isStreaming && notMe"
        :type="11"
        @click="expandedClickHandler"
      >
        {{ texts.fullscreen }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
import { mapGetters } from 'vuex';
import broadcastActions from '@sdk/classes/broadcastActions';

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {
    /**
     * User ID
     */
    userId: {
      type: String,
      default: null,
    },
    /**
     * Is this user streaming
     */
    isStreaming: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters({
      myId: 'me/getMyId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.griduser');
    },

    notMe() {
      return this.userId !== this.myId;
    },
  },

  methods: {

    /**
     * Mute click handler
     * @returns {void}
     */
    muteClickHandler() {
      broadcastActions.dispatch('users/muteForAll', this.userId);
    },

    /**
     * fullscreen click handler
     * @param {string} id user's id
     * @returns {void}
     */
    expandedClickHandler() {
      if (!this.isStreaming) {
        return;
      }
      this.$router.push({ path: `/call-window/expanded/${this.userId}` });
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
