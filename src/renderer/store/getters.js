import { sortAny } from '@libs/arrays';

/**
 * Last speaking user
 * @type {null}
 */
let lastSpeakingUser = null;

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
   * Get user who share's screen or camera
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {null|string}
   */
  getUsersWhoShareMedia: (state, getters) => {
    const selectedChannelId = getters['me/getSelectedChannelId'];
    const selectedChannel = getters['channels/getChannelById'](selectedChannelId);

    if (selectedChannel) {
      const usersWhoSharesScreen = selectedChannel.users.filter(user => user.screen).map(user => user.userId);
      const usersWhoSharesCamera = selectedChannel.users.filter(user => user.camera).map(user => user.userId);

      return [
        ...usersWhoSharesCamera,
        ...usersWhoSharesScreen,
      ];
    }

    return [];
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

  /**
   * Get speaking user
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {boolean}
   */
  getSpeakingUser: (state, getters) => {
    const selectedChannelId = getters['me/getSelectedChannelId'];
    const selectedChannel = getters['channels/getChannelById'](selectedChannelId);

    if (selectedChannel) {
      const speakingUsers = selectedChannel.users.filter(u => u.speaking && u.microphone);

      if (speakingUsers.length) {
        const speakingUserId = speakingUsers[0].userId;
        const speakingUser = getters['users/getUserById'](speakingUserId);

        if (speakingUser) {
          lastSpeakingUser = speakingUser;

          return speakingUser;
        }
      }
    }

    return lastSpeakingUser;
  },

  /**
   * Get our full info
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {object}
   */
  myInfo: (state, getters) => {
    const myId = getters['me/getMyId'];

    if (myId === undefined) {
      return null;
    }
    const commonInfo = getters['users/getUserById'](myId);
    const myMedia = getters['me/getMediaState'];

    return {
      ...commonInfo,
      ...myMedia,
    };
  },

  /**
   * Get our workspace info
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {object}
   */
  myWorkspace: (state, getters) => {
    const workspaceId = getters['me/getSelectedWorkspaceId'];

    if (!workspaceId) {
      return null;
    }

    return getters['workspaces/getWorkspaceById'](workspaceId);
  },

  /**
   * Get our channel info
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {object}
   */
  myChannel: (state, getters) => {
    const channelId = getters['me/getSelectedChannelId'];

    if (!channelId) {
      return null;
    }

    return getters['channels/getChannelById'](channelId);
  },

  /**
   * Get array with users in  our channel
   *
   * @param {object} state – global state
   * @param {object} getters – global getters
   * @returns {object}
   */
  usersInMyChannel: (state, getters) => {
    const channelId = getters['me/getSelectedChannelId'];

    if (channelId === undefined) {
      return null;
    }

    return getters.getUsersByChannel(channelId);
  },

};
