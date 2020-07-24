import API from '@api';
import i18n from '@/i18n';

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
            action: () => {
              /** Delete channel */
              console.log('delete');
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
};
