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

      <router-link
        v-if="permissions['channel.update']"
        :to="{ name: 'edit-channel', params: { id }}"
      >
        <ui-button
          :type="11"
          data-popover-close
        >
          {{ texts.edit }}
        </ui-button>
      </router-link>

      <ui-button
        v-if="permissions['channel.delete']"
        :type="11"
        data-popover-close
        @click="deleteHandler"
      >
        {{ texts.delete }}
      </ui-button>

      <ui-button
        :type="11"
        data-popover-close
        @click="inviteHandler"
      >
        {{ texts.invite }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
import { clipboard } from 'electron';
import { IS_DEV } from '@shared/Constants';

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

    /**
     * Permissions object
     */
    permissions: {
      type: Object,
      default: () => {},
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
      this.$store.dispatch('channels/deleteChannel', this.id);
    },

    /**
     * Copy invite link
     * @returns {void}
     */
    async inviteHandler() {
      const { token } = await this.$API.channel.invite(this.id);

      if (token) {
        let domain = process.env.VUE_APP_PROD_URL;

        if (IS_DEV) {
          domain = process.env.VUE_APP_DEV_URL;
        }

        clipboard.writeText(`${domain}/guest/${token}`);

        const notification = {
          data: {
            text: 'Invite link copied!',
          },
        };

        await this.$store.dispatch('app/addNotification', notification);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
