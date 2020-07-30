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
    const channel = state.collection[channelId];

    if (channel) {
      const userIndex = searchIndexByKey(channel.users, 'userId', userId);

      if (userIndex !== undefined) {
        channel.users.splice(userIndex, 1);
      }
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
    const userIndex = searchIndexByKey(users, 'userId', userId);

    if (userIndex !== undefined) {
      users.splice(userIndex, 1);
      console.error('Duplicate user occurred');
    }

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

  /**
   * Add channel
   *
   * @param {ChannelState} state – vuex state
   * @param {object} channelData – channel data
   * @constructor
   */
  ADD_CHANNEL(state, channelData) {
    if (state.collection[channelData.id] === undefined) {
      if (channelData.users === undefined) {
        channelData.users = [];
      }

      Vue.set(state.collection, channelData.id, channelData);
    }
  },

  /**
   * Remove channel
   *
   * @param {ChannelState} state – vuex state
   * @param {string} channelId – channel id
   * @constructor
   */
  REMOVE_CHANNEL(state, channelId) {
    if (state.collection[channelId]) {
      Vue.delete(state.collection, channelId);
    }
  },

  /**
   * Update channel
   *
   * @param {ChannelState} state – vuex state
   * @param {object} channel – channel data
   * @constructor
   */
  UPDATE_CHANNEL(state, channel) {
    if (state.collection[channel.id]) {
      Object.assign(state.collection[channel.id], channel);
    }
  },

};
