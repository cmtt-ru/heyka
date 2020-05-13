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
   * @param {string} id – source id
   * @constructor
   */
  SET_SHARING_SOURCE_ID(state, id) {
    state.sharingSourceId = id;
  },

};
