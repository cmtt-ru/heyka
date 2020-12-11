import { IS_LINUX } from '@sdk/Constants';

export default {
  /**
   * If janus in progress of an operation
   *
   * @param {JanusState} state – module janus state
   * @returns {boolean}
   */
  inProgress(state) {
    return state.inProgress;
  },

  /**
   * True if we are sharing whole window
   *
   * @param {JanusState} state – module janus state
   * @returns {boolean}
   */
  isSharingFullScreen(state) {
    const source = state.sharingSource;

    const sourceId = IS_LINUX ? source?.id : source?.display_id;

    if (sourceId) {
      return true;
    }

    return false;
  },

};
