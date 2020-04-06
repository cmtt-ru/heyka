import API from '@api';
import { mapKeys } from '@libs/arrays';

export default {

  async initial({ commit, dispatch }) {
    const workspaces = await API.workspace.getWorkspaces();

    const selectedWorkspaceId = workspaces[0].id;

    const workspace = await API.workspace.getWorkspaceByID(selectedWorkspaceId);

    commit('workspaces/SET_COLLECTION', mapKeys(workspaces, 'id'));

    commit('channels/SET_COLLECTION', mapKeys(workspace.channels, 'id'));

    commit('users/SET_COLLECTION', mapKeys(workspace.users, 'id'));

    commit('me/SET_WORKSPACE_ID', selectedWorkspaceId);

    return workspaces;
  },

};
