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

  getMediaState: state => {
    return state.mediaState || {};
  },
};
