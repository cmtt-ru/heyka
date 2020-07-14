import callWindow from '@classes/callWindow';
import boardHolderWindow from '@classes/boardHolderWindow';
import sleep from 'es7-sleep';

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
      boardHolderWindow.show(source.display_id);
    } else {
      callWindow.closeFrame();
      boardHolderWindow.close();
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

  /**
   * Wait until janus finishes operations
   * @param {JanusState} state – progress state
   * @returns {void}
   */
  async untilIdle({ state }) {
    const timeout = 50;

    while (state.inProgress) {
      await sleep(timeout);
    }
  },
};
