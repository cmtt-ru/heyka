import API from '@api/index';
import { mapKeys } from '@libs/arrays';

export default {
  /**
   * Update workspace list
   * @param {object} context – store context
   * @returns {void}
   */
  async updateList({ commit, dispatch, rootGetters }) {
    const workspaces = await API.workspace.getWorkspaces();

    if (workspaces.length > 0) {
      const workspacesIdList = workspaces.map(w => w.id);

      /** Selected workspace id */
      let selectedWorkspaceId = rootGetters['me/getSelectedWorkspaceId'];

      if (!selectedWorkspaceId || !workspacesIdList.includes(selectedWorkspaceId)) {
        selectedWorkspaceId = workspaces[0].id;
        dispatch('me/setSelectedWorkspaceId', selectedWorkspaceId, { root: true });
      }

      commit('SET_COLLECTION', mapKeys(workspaces, 'id'));

      return true;
    } else {
      commit('SET_COLLECTION', {});

      dispatch('me/setSelectedWorkspaceId', null, { root: true });

      return false;
    }
  },
};
