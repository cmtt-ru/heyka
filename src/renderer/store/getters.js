import { sortAny } from '@libs/arrays';

export default {

  /**
   * Get full users in Channel
   * @param {object} state – channels module state
   * @param {object} getters – channels module getters
   * @param {string} id – channel id
   * @returns {array}
   */
  getUsersByChannel: (state, getters) => (id) => {
    const ch = getters['channels/getChannelById'](id) || { users: [] };

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
    ]));
  },

  /**
   * Get user who share's screen or camera
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {null|string}
   */
  getUserWhoSharesMedia: (state, getters) => {
    const selectedChannelId = getters['me/getSelectedChannelId'];
    const selectedChannel = getters['channels/getChannelById'](selectedChannelId);

    if (selectedChannel) {
      const usersWhoSharesScreen = selectedChannel.users.filter(user => user.screen);
      const usersWhoSharesCamera = selectedChannel.users.filter(user => user.camera);

      if (usersWhoSharesScreen.length > 0) {
        return usersWhoSharesScreen[0].userId;
      }

      if (usersWhoSharesCamera.length > 0) {
        return usersWhoSharesCamera[0].userId;
      }
    }

    return null;
  },

  /**
   * Check's that I'am sharing screen or camera
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {boolean}
   */
  amISharingMedia: (state, getters) => {
    const myId = getters['me/getMyId'];
    const userWhoShares = getters['getUserWhoSharesMedia'];

    return myId === userWhoShares;
  },

  /**
   * Is anybody share's screen or camera
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {boolean}
   */
  isAnybodySharingMedia: (state, getters) => {
    const userWhoShares = getters['getUserWhoSharesMedia'];

    return userWhoShares !== null;
  },

};
