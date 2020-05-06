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

};
