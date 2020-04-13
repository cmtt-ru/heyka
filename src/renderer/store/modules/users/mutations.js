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

  /**
   * Set online status
   *
   * @param {object} state – vuex state
   * @param {object} data — online status data
   * @constructor
   */
  SET_ONLINE_STATUS(state, data) {
    const user = state.collection[data.userId];

    if (user) {
      user.onlineStatus = data.onlineStatus;
    }
  },

};
