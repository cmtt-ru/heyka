// import API from '@api';
import { sortAny } from '@libs/arrays';

export default {

  /**
   * Get full users in Channel
   * @param {object} state – channels module state
   * @param {object} getters – channels module getters
   * @param {string} id – channel id
   * @return {array}
   */
  getUsersByChannel: (state, getters) => (id) => {
    const ch = state['channels'].collection[id] || { users: [] };

    const users = ch.users.map(user => {
      return {
        ...user,
        ...getters['users/getUserById'](user.userId),
      };
    });

    return users.sort(sortAny([
      {
        key: 'name',
        type: 'string',
        order: 'asc',
      },
    ])) || [];
  },

};
