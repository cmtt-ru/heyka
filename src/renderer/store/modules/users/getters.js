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

    //! For testing:
    // if (users.length > 1) {
    // users[5].onlineStatus = 'online';
    // users[8].onlineStatus = 'online';
    // users[20].onlineStatus = 'online';
    // }

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
