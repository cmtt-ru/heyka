<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        data-popover-close
        @click="editHandler"
      >
        Сменить фото
      </ui-button>
      <ui-button
        :type="11"
        class="delete-button"
        data-popover-close
        @click="deleteHandler"
      >
        Удалить
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';

import broadcastEvents from '@sdk/classes/broadcastEvents';

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {
    /**
     * User id
     */
    userId: {
      type: String,
      default: '',
    },

    /**
     * User microphone state
     */
    microphone: {
      type: Boolean,
      default: false,
    },

    /**
     * Channel id
     */
    channelId: {
      type: String,
      default: null,
    },
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.userInChannel');
    },

    /**
     * Not me
     * @returns {boolean}
     */
    notMe() {
      return (this.$store.state.me.id !== this.userId);
    },

    /**
     * Am i in channel
     * @returns {boolean}
     */
    amIInChannel() {
      return this.$store.getters['me/getSelectedChannelId'] === this.channelId;
    },
  },

  methods: {
    /**
     * Clicked "edit" button
     * @returns {void}
     */
    editHandler() {
      broadcastEvents.dispatch('imagemodal-edit');
    },
    /**
     * Clicked "delete" button
     * @returns {void}
     */
    deleteHandler() {
      broadcastEvents.dispatch('imagemodal-delete');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .delete-button
    color var(--UI-error)

    &:hover
      background var(--UI-error-secondary)
</style>
