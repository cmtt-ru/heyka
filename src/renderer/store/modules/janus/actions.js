export default {
  /**
   * Set sharing source id
   *
   * @param {function} commit – store commit
   * @param {string} id – source id
   * @returns {void}
   */
  setSharingSourceId({ commit }, id) {
    commit('SET_SHARING_SOURCE_ID', id);
  },
};
