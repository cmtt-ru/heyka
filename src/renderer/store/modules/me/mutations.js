export default {

  /**
   * Set's user id
   *
   * @param {object} state – module me state
   * @param {string} id – user id
   * @constructor
   */
  SET_USER_ID(state, id) {
    state.id = id;
  },

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

  /**
   * Set's selected channel id
   *
   * @param {object} state – module me state
   * @param {string} id – channel id
   * @constructor
   */
  SET_CHANNEL_ID(state, id) {
    state.selectedChannelId = id;
  },

};
