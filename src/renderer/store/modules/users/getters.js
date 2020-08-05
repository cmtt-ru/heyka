import { sortByPriority } from '@libs/arrays';
import { formImageUrl } from '../../../filters/leonardo';

const AVATAR_SIZE_32 = 32;

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

  /**
   * Get user avatar url
   *
   * @param {UserState} state - user module state
   * @returns {function(*): User}
   */
  getUserAvatarUrl: state => (id, size = AVATAR_SIZE_32) => {
    const user = state.collection[id];

    if (!user) {
      return null;
    }

    if (user.avatarFileId) {
      return size <= AVATAR_SIZE_32 ? user.avatarSet.image32x32 : user.avatarSet.image64x64;
    }

    if (user.avatar) {
      return formImageUrl(user.avatar, size, size);
    }
  },
};
