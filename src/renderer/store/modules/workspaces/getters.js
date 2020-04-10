export default {

  /**
   * Get workspace by id
   *
   * @param {object} state – workspaces module state
   * @return {object}
   */
  getWorkspaceById: state => id => {
    return state.collection[id];
  },

};
