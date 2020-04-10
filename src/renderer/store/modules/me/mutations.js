export default {

  /**
   * Sets user id
   *
   * @param {object} state – module me state
   * @param {string} id – user id
   * @constructor
   */
  SET_USER_ID(state, id) {
    state.id = id;
  },

  /**
   * Sets selected workspace id
   *
   * @param {object} state – module me state
   * @param {string} id – workspace id
   * @constructor
   */
  SET_WORKSPACE_ID(state, id) {
    state.selectedWorkspaceId = id;
  },

  /**
   * Sets selected channel id
   *
   * @param {object} state – module me state
   * @param {string} id – channel id
   * @constructor
   */
  SET_CHANNEL_ID(state, id) {
    state.selectedChannelId = id;
  },

  /**
   * Sets our media state
   *
   * @param {object} state – module me state
   * @param {object} mediaState – our media state
   * @constructor
   */
  SET_MEDIA_STATE(state, mediaState) {
    state.mediaState = mediaState;
  },

};
