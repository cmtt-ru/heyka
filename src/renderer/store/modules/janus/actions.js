import callWindow from '@classes/callWindow';

export default {
  /**
   * Set sharing source id
   *
   * @param {function} commit – store commit
   * @param {object} source – source
   * @returns {void}
   */
  setSharingSource({ commit }, source) {
    commit('SET_SHARING_SOURCE', source);

    /**
     * If source has `display_id`, than show call frame window
     * else – hide frame
     */
    if (source && source.display_id) {
      callWindow.showFrame(source.display_id);
    } else {
      callWindow.closeFrame();
    }
  },

  /**
   * Set inProgress flag
   * @param {function} commit – store commit
   * @param {boolean} state – progress state
   * @returns {void}
   */
  setInProgress({ commit }, state) {
    commit('SET_IN_PROGRESS', state);
  },
};
