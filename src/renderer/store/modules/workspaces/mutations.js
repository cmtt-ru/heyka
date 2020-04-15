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

};
