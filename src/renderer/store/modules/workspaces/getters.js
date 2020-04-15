export default {
  /**
   * Get workspace by id
   *
   * @param {WorkspaceState} state – workspaces module state
   * @return {object}
   */
  getWorkspaceById: state => id => {
    return state.collection[id];
  },

};
