export default {

  /**
   * Replace full collection
   *
   * @param {object} state – vuex state
   * @param {object} collection — workspaces object
   * @constructor
   */
  SET_COLLECTION(state, collection) {
    state.collection = collection;
  },

};
