import API from '@api';

export default {
  /**
   * Mute user for all
   *
   * @param {function} commit – store commit
   * @param {string} userId – user id
   * @returns {void}
   */
  async muteForAll({ commit }, userId) {
    await API.user.muteForAll(userId);
  },
};
