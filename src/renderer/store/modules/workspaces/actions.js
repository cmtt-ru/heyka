import API from '@api';

export default {
  /**
   * Load workspaces
   * @param {object} commit – commit mutation
   * @return {Promise<unknown>}
   */
  async load({ commit }) {
    const workspaces = await API.workspace.getWorkspaces();

    console.log(workspaces);

    return workspaces;
  },

};
