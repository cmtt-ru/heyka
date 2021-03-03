import { sortByPriority, sortAny } from '@libs/arrays';
import { getUserAvatarUrl } from '@libs/image';

export default {
  /**
   * Get all users from workspace based on online status
   *
   * @param {UserState} state – user module state
   * @returns {Array.<User>}
   */
  getAllUsers: state => {
    /** @type {Array.<User>} */
    const users = Object.values(state.collection);

    return users.sort(sortByPriority({
      key: 'onlineStatus',
      priority: ['online', 'idle', 'offline'],
      name: 'name',
    })) || [];
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
