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
