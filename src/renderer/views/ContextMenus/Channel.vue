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

      <router-link
        v-if="channel.isPrivate && permissions['channel.manageMembers']"
        :to="{ name: 'channel-members', params: { id }}"
      >
        <ui-button
          :type="11"
          data-popover-close
        >
          {{ texts.members }}
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

      <ui-button
        v-if="channel.isPrivate && !permissions['channel.manageMembers']"
        :type="11"
        data-popover-close
        @click="leaveChannel"
      >
        {{ texts.leave }}
      </ui-button>
    </div>
  </popover>
</template>

<script>
import API from '@api';
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

    /**
     * Get current channel
     * @returns {object}
     */
    channel() {
      return this.$store.getters['channels/getChannelById'](this.id);
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
      this.$store.dispatch('channels/copyInviteLink', this.id);
    },

    /**
     * Leave channel
     * @returns {Promise<void>}
     */
    async leaveChannel() {
      await API.channel.leave(this.id);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
