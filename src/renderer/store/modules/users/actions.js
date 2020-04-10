import API from '@api';

export default {

  /**
   * Set user online status
   *
   * @param {function} commit – vuex commit
   * @param {string} status – online status
   * @return {Promise<void>}
   */
  async setOnlineStatus({ commit }, status) {
    commit('SET_ONLINE_STATUS', status);
    await API.user.setOnlineStatus(status);
  },

};
