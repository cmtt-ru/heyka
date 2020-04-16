import { searchIndexByKey } from '@libs/arrays';
import Vue from 'vue';

export default {

  /**
   * Replace full collection
   *
   * @param {ChannelState} state – vuex state
   * @param {ChannelCollection} collection — channels object
   * @constructor
   */
  SET_COLLECTION(state, collection) {
    state.collection = collection;
  },

  /**
   * Remove specific user from specific channel
   *
   * @param {ChannelState} state – vuex state
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
   * Add specific user from specific channel
   *
   * @param {ChannelState} state – vuex state
   * @param {string} userId – user id
   * @param {string} channelId – channel id
   * @param {MediaState} userMediaState – user media state
   * @constructor
   */
  ADD_USER(state, { userId, channelId, userMediaState }) {
    const users = state.collection[channelId].users;

    users.push({
      userId,
      ...userMediaState,
    });
  },

  /**
   * Set specific user media state
   *
   * @param {ChannelState} state – vuex state
   * @param {string} userId – user id
   * @param {string} channelId – channel id
   * @param {MediaState} userMediaState – user media state
   * @constructor
   */
  SET_USER_MEDIA_STATE(state, { userId, channelId, userMediaState }) {
    const users = state.collection[channelId].users;
    const userIndex = searchIndexByKey(users, 'userId', userId);

    if (userIndex !== undefined) {
      Vue.set(users, userIndex, {
        ...users[userIndex],
        ...userMediaState,
      });
    }
  },
};
