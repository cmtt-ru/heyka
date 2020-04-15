export default {
  /**
   * Get user id
   *
   * @param {MeState} state – module me state
   * @return {string}
   */
  getMyId(state) {
    return state.id;
  },

  /**
   * Get selected workspace id
   *
   * @param {MeState} state – me module state
   * @return {string}
   */
  getSelectedWorkspaceId: state => {
    return state.selectedWorkspaceId;
  },

  /**
   * Get media state
   *
   * @param {MeState} state – me module state
   * @return {object}
   */
  getMediaState: state => {
    return state.mediaState;
  },

  /**
   * Get selected channel id
   *
   * @param {MeState} state – me module state
   * @return {string}
   */
  getSelectedChannelId: state => {
    return state.selectedChannelId;
  },
};
