export default {

  /**
   * Sets user id
   *
   * @param {MeState} state – module me state
   * @param {string} id – user id
   * @constructor
   */
  SET_USER_ID(state, id) {
    state.id = id;
  },

  /**
   * Sets selected workspace id
   *
   * @param {MeState} state – module me state
   * @param {string} id – workspace id
   * @constructor
   */
  SET_WORKSPACE_ID(state, id) {
    state.selectedWorkspaceId = id;
  },

  /**
   * Sets selected channel id
   *
   * @param {MeState} state – module me state
   * @param {string} id – channel id
   * @constructor
   */
  SET_CHANNEL_ID(state, id) {
    state.selectedChannelId = id;
  },

  /**
   * Sets our media state
   *
   * @param {MeState} state – module me state
   * @param {MediaState} mediaState – our media state
   * @constructor
   */
  SET_MEDIA_STATE(state, mediaState) {
    state.mediaState = mediaState;
  },

  /**
   * Sets our media state
   *
   * @param {MeState} state – module me state
   * @param {MediaState} mediaState – our media state
   * @constructor
   */
  SET_PREVIOUS_STATE(state, mediaState) {
    state.previousMediaState = mediaState;
  },

  /**
   * Sets our online status
   *
   * @param {MeState} state – module me state
   * @param {string} status – online status
   * @constructor
   */
  SET_ONLINE_STATUS(state, status) {
    state.previousOnlineStatus = state.onlineStatus;
    state.onlineStatus = status;
  },

  /**
   * Sets our suspend state
   *
   * @param {MeState} state – module me state
   * @param {boolean} value – state
   * @constructor
   */
  SET_SUSPEND_STATE(state, value) {
    state.suspendState = value;
  },

  /**
   * Sets our lock screen state
   *
   * @param {MeState} state – module me state
   * @param {boolean} value – state
   * @constructor
   */
  SET_LOCK_SCREEN_STATE(state, value) {
    state.lockScreenState = value;
  },

  /**
   * Allow/forbid drawing on your screen while sharing it
   *
   * @param {MeState} state – module me state
   * @param {boolean} value – state
   * @constructor
   */
  SET_ALLOW_DRAW(state, value) {
    state.allowDraw = value;
  },

  /**
   * Update data
   *
   * @param {MeState} state – module me state
   * @param {object} data – data
   * @constructor
   */
  UPDATE(state, data) {
    state = Object.assign(state, data);
  },

};
