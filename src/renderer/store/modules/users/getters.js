import { flattenObject, sortAny } from '@libs/arrays';

export default {

  /**
   * Get all users from workspace
   *
   * @param {object} state – users' module state
   * @return {object} users' collection
   */
  getAllUsers: state => {
    const users = flattenObject(state.collection);

    return users.sort(sortAny([
      {
        key: 'name',
        type: 'string',
        order: 'asc',
      },
    ])) || [];
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
