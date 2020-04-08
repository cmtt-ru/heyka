export default {

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
