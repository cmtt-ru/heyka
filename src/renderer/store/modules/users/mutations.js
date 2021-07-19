import Vue from 'vue';

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
   * Update specific user
   *
   * @param {UserState} state – user module state
   * @param {object} data — online status object
   * @param {string} data.id – user id
   * @constructor
   */
  UPDATE_USER(state, data) {
    if (state.collection[data.id]) {
      for (const key in data) {
        Vue.set(state.collection[data.id], key, data[key]);
      }
    }
  },

  /**
   * Add new  user
   *
   * @param {UserState} state – user module state
   * @param {object} data — online status object
   * @param {string} data.id – user id
   * @constructor
   */
  ADD_USER(state, data) {
    console.log('ADD_USER', data);
    Vue.set(state.collection, data.id, { ...data });
  },

  /**
   * Remove specific user by id
   *
   * @param {UserState} state – user module state
   * @param {string} userId – user id
   * @constructor
   */
  REMOVE_USER(state, userId) {
    if (state.collection[userId]) {
      Vue.delete(state.collection, userId);
    }
  },

  /**
   * Set online status
   *
   * @param {UserState} state – user module state
   * @param {object} data — online status object
   * @param {string} data.userId – user id
   * @param {string} data.onlineStatus – user online status
   * @constructor
   */
  SET_ONLINE_STATUS(state, data) {
    const user = state.collection[data.userId];

    if (user) {
      user.onlineStatus = data.onlineStatus;
    }
  },

};
