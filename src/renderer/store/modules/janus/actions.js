import callWindow from '@classes/callWindow';
import boardHolderWindow from '@classes/boardHolderWindow';
import sleep from 'es7-sleep';
import { IS_LINUX } from '../../../../shared/Constants';

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
    const sourceId = IS_LINUX ? source.id : source.display_id;

    if (source && sourceId) {
      callWindow.showFrame(sourceId);
      console.log('Create boardHolderWindow');
      boardHolderWindow.show(sourceId);
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
