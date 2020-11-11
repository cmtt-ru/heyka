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
        size="small"
        :disabled="!isAnyChanges"
        @click="createHandler"
      >
        {{ texts.buttonCreate }}
      </ui-button>

      <ui-button
        v-if="isEditMode"
        :type="1"
        size="small"
        :disabled="!isAnyChanges"
        @click="saveHandler"
      >
        {{ texts.buttonSave }}
      </ui-button>

      <ui-button
        :type="2"
        class="l-mr-8"
        size="small"
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
import { obj2hash } from '@libs/utils';

/**
 * Default channel model
 */
const CHANNEL_MODEL = {
  name: '',
  description: '',
  isPrivate: false,
};

export default {
  components: {
    UiInput,
    UiSwitch,
    UiButton,
    PseudoPopup,
  },
  data() {
    return {
      channelModel: {},
      channelModelHash: 0,
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

    /**
     * Detect's changes in channel model
     * @returns {boolean}
     */
    isAnyChanges() {
      const hash = obj2hash(this.channelModel);

      return hash !== this.channelModelHash;
    },
  },

  watch: {
    isEditMode() {
      this.updateChannelModel();
    },
  },

  mounted() {
    this.updateChannelModel();
  },

  methods: {
    /**
     * Update channel model
     * @returns {void}
     */
    updateChannelModel() {
      if (this.isEditMode) {
        this.channelModel = cloneDeep(this.getChannelById(this.channelId));
        this.channelModelHash = obj2hash(this.channelModel);
      } else {
        this.channelModel = cloneDeep(CHANNEL_MODEL);
        this.channelModelHash = obj2hash(this.channelModel);
      }
    },
    /**
     * Create new channel handler
     * @returns {void}
     */
    async createHandler() {
      const channel = await this.$store.dispatch('channels/createChannel', {
        name: this.channelModel.name,
        isPrivate: this.channelModel.isPrivate,
      });

      /** Redirect to new created channel */
      if (channel) {
        await this.$router.replace({
          name: 'channel',
          params: {
            id: channel.id,
          },
        });
      }
    },

    /**
     * Save channel handler
     * @returns {void}
     */
    async saveHandler() {
      await this.$store.dispatch('channels/editChannel', {
        id: this.channelId,
        channel: {
          name: this.channelModel.name,
          // isPrivate: this.channelModel.isPrivate,
        },
      });

      await this.$router.replace({
        name: 'channel',
        params: {
          id: this.channelId,
        },
      });
    },

    /**
     * Cancel handler
     * @returns {void}
     */
    cancelHandler() {
      this.$router.back();
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
