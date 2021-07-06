<template>
  <pseudo-popup
    cancel-text
    @close="cancelHandler"
  >
    <template #header>
      {{ title }}
    </template>

    <template #body>
      <ui-form
        ref="form"
        @submit="formSubmitHandler"
      >
        <ui-input
          v-model="channelModel.name"
          class="l-mt-4"
          :class="{'l-mb-12': !isEditMode}"
          :icon="channelIcon"
          :minlength="2"
          :placeholder="texts.name"
          required
          lowercase
        />

        <ui-switch
          v-if="!isEditMode"
          v-model="channelModel.isPrivate"
          :text="texts.private"
        />

        <p
          v-if="channelModel.isPrivate && !isEditMode"
          class="edit-channel-label"
          :class="{'l-mt-4': channelModel.isPrivate, 'l-mt-12': !channelModel.isPrivate}"
        >
          {{ texts.privateLabel }}
        </p>

        <ui-button
          v-if="!isEditMode"
          :type="1"
          size="large"
          class="l-mt-16"
          wide
          submit
        >
          {{ texts.buttonCreate }}
        </ui-button>

        <ui-button
          v-if="isEditMode"
          :type="1"
          size="large"
          wide
          submit
          class="l-mt-18 l-mb-12"
        >
          {{ texts.buttonSave }}
        </ui-button>

        <ui-button
          v-if="isEditMode"
          :type="17"
          size="large"
          class="edit-channel-delete"
          wide
          @click="deleteHandler"
        >
          {{ texts.buttonDelete }}
        </ui-button>
      </ui-form>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm, UiInput, UiSwitch } from '@components/Form';
import PseudoPopup from '@components/PseudoPopup';
import cloneDeep from 'clone-deep';
import { mapGetters } from 'vuex';

/**
 * Default channel model
 */
const CHANNEL_MODEL = {
  name: '',
  isPrivate: false,
};

export default {
  components: {
    UiForm,
    UiInput,
    UiSwitch,
    UiButton,
    PseudoPopup,
  },

  data() {
    return {
      channelModel: {},
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
     * Channel icon
     * @returns {string}
     */
    channelIcon() {
      if (this.channelModel.isPrivate) {
        return 'lock';
      } else {
        return 'channel';
      }
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
      } else {
        this.channelModel = cloneDeep(CHANNEL_MODEL);
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
      this.__backOrRedirect();
    },

    /**
     * Delete channel handler
     * @returns {void}
     */
    deleteHandler() {
      this.$store.dispatch('channels/deleteChannel', this.channelId);
    },

    /**
     * Submit form handler
     * @returns {void}
     */
    submitHandler() {
      this.$refs.form.submitHandler();
    },

    formSubmitHandler() {
      if (this.isEditMode) {
        this.saveHandler();
      } else {
        this.createHandler();
      }
    },
  },
};
</script>

<style scoped lang="stylus">
  .edit-channel-label
    line-height 22px
    font-size 14px
    color var(--Text-secondary)
    font-weight 400

  .edit-channel-delete
    color var(--UI-error)
</style>
