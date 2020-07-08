import API from '@api';

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
    // const myUserId = rootGetters['me/getMyId'];

    if (isChannelExist) {
      return;
    }

    const channelInfo = await API.channel.info(channelId);

    if (channelInfo) {
      commit('ADD_CHANNEL', channelInfo);

    //   if (channelInfo.isPrivate && channelInfo.isTemporary && myUserId === channelInfo.creatorId) {
    //     dispatch('app/addPush', {
    //       channel: channelInfo.id,
    //       messageId: Date.now(),
    //       userId: channelInfo.creatorId,
    //       message: {
    //         action: 'invite',
    //       },
    //     }, { root: true });
    //   }
    }
  },
};
