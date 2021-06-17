export default {
  /**
   * Replace full collection
   *
   * @param {WorkspaceState} state – vuex state
   * @param {WorkspaceCollection} collection — workspaces object
   * @constructor
   */
  SET_COLLECTION(state, collection) {
    state.collection = collection;
  },

  /**
   * Save workspace settings by id
   *
   * @param {WorkspaceState} state – vuex state
   * @param {string} param.id – workspace id
   * @param {object} param.settings — workspace settings
   *
   * @returns {void}
   */
  SET_SETTINGS(state, { id, settings }) {
    state.workspaceSettings[id] = settings;
  },

};
