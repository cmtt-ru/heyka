<template>
  <pseudo-popup @close="cancelHandler">
    <template #header>
      {{ title }}
    </template>

    <template #body />

    <template #footer>
      <ui-button
        v-if="!isEditMode"
        :type="1"
        class="l-mr-8"
        @click="createHandler"
      >
        {{ texts.buttonCreate }}
      </ui-button>

      <ui-button
        v-if="isEditMode"
        :type="1"
        class="l-mr-8"
        @click="saveHandler"
      >
        {{ texts.buttonSave }}
      </ui-button>

      <ui-button
        :type="2"
        @click="cancelHandler"
      >
        {{ texts.buttonCancel }}
      </ui-button>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import PseudoPopup from '@components/PseudoPopup';

export default {
  components: {
    UiButton,
    PseudoPopup,
  },
  data() {
    return {

    };
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.editChannel');
    },

    /**
     * Channel id
     * @returns {string}
     */
    channelId() {
      return this.$route.params?.id;
    },

    /**
     * Is edit mode
     * @returns {boolean}
     */
    isEditMode() {
      return this.channelId !== undefined;
    },

    /**
     * Form title
     * @returns {string}
     */
    title() {
      if (this.channelId) {
        return this.texts.editTitle;
      } else {
        return this.texts.createTitle;
      }
    },
  },
  created() {

  },
  methods: {
    /**
     * Create new channel handler
     * @returns {void}
     */
    createHandler() {
      console.log('create handler');
    },

    /**
     * Save channel handler
     * @returns {void}
     */
    saveHandler() {
      console.log('save handler');
    },

    /**
     * Cancel handler
     * @returns {void}
     */
    cancelHandler() {
      console.log('cancel handler');
    },
  },
};
</script>

<style scoped lang="stylus">

</style>
