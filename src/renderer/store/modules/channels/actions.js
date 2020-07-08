import API from '@api';

export default {
  /**
   * Add existing channel by id
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async addChannel({ commit, getters }, channelId) {
    const isChannelExist = getters['getChannelById'](channelId);

    if (isChannelExist) {
      return;
    }

    const channelInfo = await API.channel.info(channelId);

    console.log('channelInfo', channelInfo);
    // commit('ADD_CHANNEL', channelInfo);
  },
};
