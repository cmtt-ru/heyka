export default {

  /**
   * Replace full collection
   *
   * @param {object} state – vuex state
   * @param {object} collection — users object
   * @constructor
   */
  SET_COLLECTION(state, collection) {
    state.collection = collection;
  },

};
