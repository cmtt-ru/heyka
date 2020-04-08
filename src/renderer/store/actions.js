import API from '@api';
import { mapKeys } from '@libs/arrays';

export default {

  /**
   * Initialize store and app state
   * @param {object} context – store context
   * @return {void}
   */
  async initial({ commit, dispatch, getters }) {
    /** Get authenticated user */
    const authenticatedUser = await API.user.getAuthenticatedUser();

    /** Authenticated user id */
    const userId = authenticatedUser.id;

    if (userId) {
      /** Get workspaces list */
      /**
       * todo: Предусмотреть, что воркспейсов может не быть.
       *       Перекинуть юзера на веб страницу где можно создать воркспейс
       */
      const workspaces = await API.workspace.getWorkspaces();

      /** Selected workspace id */
      let selectedWorkspaceId = getters['me/getSelectedWorkspaceId'];

      if (!selectedWorkspaceId) {
        selectedWorkspaceId = workspaces[0].id;
        dispatch('me/setSelectedWorkspaceId', selectedWorkspaceId);
      }

      /** Get specific workspace data */
      const workspace = await API.workspace.getWorkspaceByID(selectedWorkspaceId);

      commit('me/SET_USER_ID', userId);
      commit('workspaces/SET_COLLECTION', mapKeys(workspaces, 'id'));
      commit('channels/SET_COLLECTION', mapKeys(workspace.channels, 'id'));
      commit('users/SET_COLLECTION', mapKeys(workspace.users, 'id'));
    } else {
      console.error('AUTH REQUIRED');
    }
  },

  /**
   * Select (join) channel
   * @param {object} context – store context
   * @param {string} id – channel id
   * @return {object} selected channel
   */
  async selectChannel({ commit, getters }, id) {
    const channel = await API.channel.select(id, getters['me/getMediaState']);

    commit('me/SET_CHANNEL_ID', id);

    return channel;
  },

  /**
   * Unselect (join) channel
   * @param {object} context – store context
   * @param {string} id – channel id
   * @return {object} unselected channel
   */
  async unselectChannel({ commit }, id) {
    const channel = await API.channel.unselect(id);

    commit('me/SET_CHANNEL_ID', null);

    return channel;
  },

};
