<template>
  <popover>
    <div class="buttons">
      <ui-button
        :type="11"
        data-popover-close
        @click="hideHandler"
      >
        {{ texts.hide }}
      </ui-button>

      <router-link :to="{ name: 'edit-channel', params: { id }}">
        <ui-button
          :type="11"
          data-popover-close
        >
          {{ texts.edit }}
        </ui-button>
      </router-link>

      <ui-button
        :type="11"
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

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {
    /**
     * Channel id
     */
    id: {
      type: String,
      default: '',
    },
  },

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.channel');
    },
  },

  methods: {
    /**
     * Hide channel handler
     * @returns {void}
     */
    hideHandler() {
      this._notImplemented();
    },

    /**
     * Delete channel handler
     * @returns {void}
     */
    deleteHandler() {
      this._notImplemented();
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
