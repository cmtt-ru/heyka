import API from '@api';
import { mapKeys } from '@libs/arrays';

export default {

  async initial({ commit, dispatch, getters }) {
    /**
     * Get authenticated user
     */
    const authenticatedUser = await API.user.getAuthenticatedUser();

    /**
     * Authenticated user id
     */
    const userId = authenticatedUser.id;

    if (userId) {
      /**
       * Get workspaces list
       */
      const workspaces = await API.workspace.getWorkspaces();

      /**
       * Selected workspace id
       */
      let selectedWorkspaceId = getters['me/selectedWorkspaceId'];

      if (!selectedWorkspaceId) {
        selectedWorkspaceId = workspaces[0].id;
        dispatch('me/setSelectedWorkspaceId', selectedWorkspaceId);
      }

      /**
       * Get specific workspace data
       */
      const workspace = await API.workspace.getWorkspaceByID(selectedWorkspaceId);

      commit('me/SET_USER_ID', userId);

      commit('workspaces/SET_COLLECTION', mapKeys(workspaces, 'id'));

      commit('channels/SET_COLLECTION', mapKeys(workspace.channels, 'id'));

      commit('users/SET_COLLECTION', mapKeys(workspace.users, 'id'));
    } else {
      console.error('AUTH REQUIRED');
    }
  },

};
