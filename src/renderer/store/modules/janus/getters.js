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
};
