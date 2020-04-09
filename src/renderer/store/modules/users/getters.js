import { sortByPriority } from '@libs/arrays';

export default {

  /**
   * Get all users from workspace
   *
   * @param {object} state – users' module state
   * @return {object} users' collection
   */
  getAllUsers: state => {
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
   * @param {object} state – users' module state
   * @return {object} user
   */
  getUserById: state => id => {
    const user = state.collection[id] || null;

    return user;
  },
};
