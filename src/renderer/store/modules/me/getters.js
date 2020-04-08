export default {
  /**
   * Get selected workspace id
   *
   * @param {object} state – me module state
   * @return {string}
   */
  getSelectedWorkspaceId: state => {
    return state.selectedWorkspaceId;
  },

  /**
   * Get media state
   *
   * @param {object} state – me module state
   * @return {object}
   */
  getMediaState: state => {
    return state.mediaState || {};
  },

  /**
   * Get selected channel id
   *
   * @param {object} state – me module state
   * @return {string}
   */
  getSelectedChannelId: state => {
    return state.selectedChannelId;
  },
};
