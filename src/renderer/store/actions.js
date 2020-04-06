import API from '@api';
import { mapKeys } from '@libs/arrays';

export default {

  async initial({ commit, dispatch }) {
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
       * @todo: store & load from local store
       */
      const selectedWorkspaceId = workspaces[0].id;

      /**
       * Get specific workspace data
       */
      const workspace = await API.workspace.getWorkspaceByID(selectedWorkspaceId);

      /**
       * Selected channel id
       * @todo: store & load from local store
       */
      const selectedChannelId = workspace.channels[0].id;

      commit('me/SET_USER_ID', userId);

      commit('workspaces/SET_COLLECTION', mapKeys(workspaces, 'id'));

      commit('channels/SET_COLLECTION', mapKeys(workspace.channels, 'id'));

      commit('users/SET_COLLECTION', mapKeys(workspace.users, 'id'));

      commit('me/SET_WORKSPACE_ID', selectedWorkspaceId);

      commit('me/SET_CHANNEL_ID', selectedChannelId);
    } else {
      console.error('AUTH REQUIRED');
    }
  },

};
