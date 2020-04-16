export default {

  /**
   * Set janus options
   *
   * @param {JanusState} state – vuex state
   * @param {JanusState} options – janus options
   * @constructor
   */
  SET_OPTIONS(state, options) {
    state = {
      ...state,
      ...options,
    };
  },

};
