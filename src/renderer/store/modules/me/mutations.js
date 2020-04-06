export default {
  /**
   * Set's selected workspace id
   *
   * @param {object} state – module me state
   * @param {string} id – workspace id
   * @constructor
   */
  SET_WORKSPACE_ID(state, id) {
    state.selectedWorkspaceId = id;
  },

};
