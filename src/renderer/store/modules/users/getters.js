import { sortByPriority } from '@libs/arrays';

export default {
  /**
   * Get all users from workspace
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
   * Get user info by his id
   *
   * @param {UserState} state – user module state
   * @returns {function(*): User}
   */
  getUserById: state => id => {
    return state.collection[id] || null;
  },
};
