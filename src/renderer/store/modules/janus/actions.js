import callWindow from '@classes/callWindow';
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
    /* eslint-disable-next-line */
    const sourceId = source?.display_id || source?.id;

    if (source && source.index) {
      console.log('SETTING SHARING SOURCE', source);
      console.log('sourceId: ', sourceId);
      console.log('sourceIndex: ', source.index);

      // source.index is needed for OS where display_id is not defined
      callWindow.showFrame(sourceId, source.index);
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
