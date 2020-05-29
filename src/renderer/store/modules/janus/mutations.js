export default {

  /**
   * Set janus options
   *
   * @param {JanusState} state – vuex state
   * @param {JanusState} options – janus options
   * @constructor
   */
  SET_OPTIONS(state, options) {
    Object.assign(state, options);
  },

  /**
   * Set's sharing source id
   *
   * @param {JanusState} state – module me state
   * @param {object} source – source
   * @constructor
   */
  SET_SHARING_SOURCE(state, source) {
    state.sharingSource = source;
  },

  /**
   * Set inProgress status for janus
   * @param {JanusState} state – vuex state
   * @param {boolean} flag – inProgress state
   * @returns {void}
   */
  SET_IN_PROGRESS(state, flag) {
    state.inProgress = !!flag;
  },

};
