import { searchIndexByKey } from '@libs/arrays';

export default {

  /**
   * Replace full collection
   *
   * @param {object} state – vuex state
   * @param {object} collection — channels object
   * @constructor
   */
  SET_COLLECTION(state, collection) {
    state.collection = collection;
  },

  /**
   * Remove specific user from specific channel
   *
   * @param {object} state – vuex state
   * @param {string} userId – user id
   * @param {string} channelId – channel id
   * @constructor
   */
  REMOVE_USER(state, { userId, channelId }) {
    const users = state.collection[channelId].users;
    const userIndex = searchIndexByKey(users, 'userId', userId);

    if (userIndex !== undefined) {
      users.splice(userIndex, 1);
    }
  },

  /**
   * Remove specific user from specific channel
   *
   * @param {object} state – vuex state
   * @param {object} data – user data
   * @constructor
   */
  ADD_USER(state, data) {
    const users = state.collection[data.channelId].users;

    users.push(data);
  },
};
