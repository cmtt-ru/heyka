import API from '@api';
import { mapKeys } from '@libs/arrays';

export default {

  /**
   * Initialize store and app state
   * @param {object} context – store context
   * @returns {void}
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
   * @returns {object} selected channel
   */
  async selectChannel({ commit, getters, state }, id) {
    const response = await API.channel.select(id, getters['me/getMediaState']);

    if (state.me.selectedChannelId !== null && state.me.selectedChannelId !== '') {
      commit('channels/REMOVE_USER', {
        userId: state.me.id,
        channelId: state.me.selectedChannelId,
      });
    }
    commit('janus/SET_OPTIONS', response.connectionOptions);
    commit('channels/ADD_USER', {
      userId: state.me.id,
      channelId: id,
      userMediaState: getters['me/getMediaState'],
    });
    commit('me/SET_CHANNEL_ID', id);
  },

  /**
   * Unselect (join) channel
   * @param {object} context – store context
   * @param {string} id – channel id
   * @returns {object} unselected channel
   */
  async unselectChannel({ commit, state }, id) {
    await API.channel.unselect(id);

    commit('channels/REMOVE_USER', {
      userId: state.me.id,
      channelId: id,
    });
    commit('me/SET_CHANNEL_ID', null);
  },

  /**
   * Set socket connected
   * @param {object} context store context
   * @param {boolean} value is socket connected
   * @returns {void}
   */
  async setSocketConnected({ commit }, value) {
    commit('SET_SOCKET_CONNECTED', value);
  },

};
