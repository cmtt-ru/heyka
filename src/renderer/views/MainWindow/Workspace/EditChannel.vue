<template>
  <pseudo-popup @close="cancelHandler">
    <template #header>
      {{ title }}
    </template>

    <template #body>
      <ui-input
        v-model="channelModel.name"
        class="l-mt-16 l-mb-12"
        icon="channel"
        :placeholder="texts.name"
      />

      <ui-input
        v-model="channelModel.description"
        class="l-mb-24"
        disabled
        :placeholder="texts.description"
      />

      <ui-switch
        v-model="channelModel.private"
        class="l-mb-16"
        disabled
        :text="texts.private"
      />

      <ui-switch
        v-model="channelModel.chat"
        class="l-mb-10"
        disabled
        :text="texts.chat"
      />

      <ui-button
        v-if="isEditMode"
        :type="14"
        class="l-mr-8"
        @click="deleteHandler"
      >
        {{ texts.buttonDelete }}
      </ui-button>
    </template>

    <template #footer>
      <ui-button
        v-if="!isEditMode"
        :type="1"
        class="l-mr-8"
        :disabled="!isAnyChanges"
        @click="createHandler"
      >
        {{ texts.buttonCreate }}
      </ui-button>

      <ui-button
        v-if="isEditMode"
        :type="1"
        class="l-mr-8"
        :disabled="!isAnyChanges"
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
import { UiInput, UiSwitch } from '@components/Form';
import PseudoPopup from '@components/PseudoPopup';
import cloneDeep from 'clone-deep';
import { mapGetters } from 'vuex';

const CHANNEL_MODEL = {
  name: '',
  description: '',
  isPrivate: false,
};

/**
 * String to hash
 * @param {string} object – js object
 * @returns {number}
 */
function obj2hash(object) {
  const str = JSON.stringify(object);

  let hash = 0,
      i, chr;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    // eslint-disable-next-line no-magic-numbers
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }

  return hash;
}

export default {
  components: {
    UiInput,
    UiSwitch,
    UiButton,
    PseudoPopup,
  },
  data() {
    return {
      channelModel: cloneDeep(CHANNEL_MODEL),
      channelModelHash: obj2hash(cloneDeep(CHANNEL_MODEL)),
    };
  },
  computed: {
    ...mapGetters({
      getChannelById: 'channels/getChannelById',
    }),

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

    isAnyChanges() {
      const hash = obj2hash(this.channelModel);

      return hash !== this.channelModelHash;
    },
  },

  mounted() {
    /** Get channel data in edit mode*/
    if (this.isEditMode) {
      this.channelModel = cloneDeep(this.getChannelById(this.channelId));
      this.channelModelHash = obj2hash(this.channelModel);
    }
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

    /**
     * Delete channel handler
     * @returns {void}
     */
    deleteHandler() {
      this.$store.dispatch('channels/deleteChannel', this.channelId);
    },
  },
};
</script>

<style scoped lang="stylus">

</style>
