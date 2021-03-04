import { sortByPriority, sortAny } from '@libs/arrays';
import { getUserAvatarUrl } from '@libs/image';

export default {
  /**
   * Get all users from workspace based on online status
   *
   * @param {UserState} state – user module state
   * @param {object} getters – vuex getters
   * @returns {Array.<User>}
   */
  getAllUsers: (state, getters) => {
    /** @type {Array.<User>} */
    const users = getters['getAllUsersByFrequency'];

    const onlineUsers = [];
    const offlineUsers = [];

    users.forEach(u => {
      if (u.onlineStatus === 'offline') {
        onlineUsers.push(u);
      } else {
        offlineUsers.push(u);
      }
    });

    return offlineUsers.concat(onlineUsers);
  },

  /**
   * Get all users from workspace based on online status AND calls frequency
   *
   * @param {UserState} state – user module state
   * @returns {Array.<User>}
   */
  getAllUsersByFrequency: state => {
    /** @type {Array.<User>} */
    const users = Object.values(state.collection);

    return users.sort(sortByPriority({
      key: 'onlineStatus',
      priority: ['online', 'idle', 'offline'],
      name: 'name',
    })).sort(sortAny(
      {
        key: 'callsCount',
        type: 'number',
        order: 'desc',
      }
    )) || [];
  },

  /**
   * Get user info by his id
   *
   * @param {UserState} state – user module state
   * @returns {function(*): User}
   */
  getUserById: state => id => {
    return state.collection[id] || null;
  },

  /**
   * Get user avatar url
   *
   * @param {UserState} state - user module state
   * @returns {function(*): User}
   */
  getUserAvatarUrl: state => (id, size) => {
    const user = state.collection[id];

    if (!user) {
      return null;
    }

    return getUserAvatarUrl(user, size);
  },
};
