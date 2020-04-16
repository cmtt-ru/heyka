export default {

  /**
   * Replace full collection
   *
   * @param {UserState} state – user module state
   * @param {UserCollection} collection — user collection object
   * @constructor
   */
  SET_COLLECTION(state, collection) {
    state.collection = collection;
  },

  /**
   * Set online status
   *
   * @param {UserState} state – user module state
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
