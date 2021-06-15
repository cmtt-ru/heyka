import { sortAny } from '@libs/arrays';

export default {
  /**
   * Get sorted workspaces
   *
   * @param {WorkspaceState} state – channels module state
   * @returns {array}
   */
  getWorkspaces: state => {
    return Object.values(state.collection).sort(sortAny([
      {
        key: 'name',
        type: 'string',
        order: 'asc',
      },
    ]));
  },

  /**
   * Get workspace by id
   *
   * @param {WorkspaceState} state – workspaces module state
   * @returns {object}
   */
  getWorkspaceById: state => id => {
    return state.collection[id];
  },

  /**
   * Get workspace settings by id
   *
   * @param {WorkspaceState} state – workspaces module state
   * @returns {object}
   */
  getWorkspaceSettings: state => id => {
    return state.workspaceSettings[id];
  },

  /**
   * Get current workspace settings
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @param {object} rootState – vuex root state
   * @param {object} rootGetters – vuex root getters
   * @returns {object}
   */
  getCurrentWorkspaceSettings: (state, getters, rootState, rootGetters) => {
    const workspaceId = rootGetters['me/getSelectedWorkspaceId'];

    return state.workspaceSettings[workspaceId] || {};
  },

};
