<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        data-popover-close
        @click="editHandler"
      >
        {{ texts.change }}
      </ui-button>
      <ui-button
        :type="11"
        class="delete-button"
        data-popover-close
        @click="deleteHandler"
      >
        {{ texts.delete }}
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

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.changePhoto');
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
