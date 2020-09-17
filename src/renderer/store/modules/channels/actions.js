import API from '@api';
import i18n from '@sdk/translations/i18n';
import router from '@/router';
import { IS_DEV } from '@sdk/Constants';

export default {
  /**
   * Add existing channel by id
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async addChannel({ commit, getters, dispatch, rootGetters }, channelId) {
    const isChannelExist = getters['getChannelById'](channelId);

    if (isChannelExist) {
      return;
    }

    const channelInfo = await API.channel.info(channelId);

    if (channelInfo) {
      commit('ADD_CHANNEL', channelInfo);
    }
  },

  /**
   * Edit existing channel
   *
   * @param {object} vuex functions
   * @param {object} id – channel id
   * @param {object} channel – channel data
   * @param {string} channel.name – channel name
   * @param {boolean} channel.isPrivate – private state
   * @returns {Promise<void>}
   */
  async editChannel({ commit, getters, dispatch, rootGetters }, { id, channel }) {
    await API.channel.edit(id, channel);
  },

  /**
   * Create new channel
   *
   * @param {object} vuex functions
   * @param {object} channel – channel data
   * @param {string} channel.name – channel name
   * @param {boolean} channel.isPrivate – private state
   * @returns {Promise<void>}
   */
  async createChannel({ commit, getters, dispatch, rootGetters }, channel) {
    const workspaceId = rootGetters['me/getSelectedWorkspaceId'];
    const response = await API.channel.create(workspaceId, channel);

    if (response.channel.id) {
      return response.channel;
    }

    return false;
  },

  /**
   * Delete channel by id
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async deleteChannel({ commit, getters, dispatch, rootGetters }, channelId) {
    const channel = getters['getChannelById'](channelId);

    if (!channel) {
      return;
    }

    const texts = i18n.t('notifications.deleteChannel');

    const notification = {
      modal: true,
      data: {
        text: `${texts.text} "${channel.name}"?`,
        buttons: [
          {
            text: texts.yes,
            type: 12,
            action: async () => {
              /** Delete channel */
              await API.channel.remove(channelId);
              router.push({ name: 'workspace' });
            },
          },
          {
            text: texts.no,
            close: true,
          },
        ],
      },
    };

    await dispatch('app/addNotification', notification, { root: true });
  },

  /**
   * Copy invite link to channel
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async copyInviteLink({ dispatch }, channelId) {
    const { token } = await API.channel.invite(channelId);

    if (token) {
      let domain = process.env.VUE_APP_PROD_URL;

      if (IS_DEV) {
        domain = process.env.VUE_APP_DEV_URL;
      }

      navigator.clipboard.writeText(`${domain}/guest/${token}`);

      const texts = i18n.t('workspace.channel');

      const notification = {
        data: {
          text: texts.inviteCopied,
        },
      };

      await dispatch('app/addNotification', notification, { root: true });
    }
  },

  /**
   * Revoke invite links to channel
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async revokeInviteLinks({ dispatch }, channelId) {
    await API.channel.deleteAllInvites(channelId);

    const texts = i18n.t('workspace.channel');

    const notification = {
      data: {
        text: texts.invitesDeleted,
      },
    };

    await dispatch('app/addNotification', notification, { root: true });
  },
};
