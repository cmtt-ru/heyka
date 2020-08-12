/**
 * @typedef {object} User
 * @property {string} userId – user id
 * @property {string} name – user name
 * @property {string} email – user email
 * @property {boolean} isEmailVerified – email verification status
 * @property {string} avatar – leonardo url
 * @property {string} avatarFileId – uploaded file id
 * @property {object} avatarSet – object with different sized images (image32x32, image100x50, etc.)
 * @property {string} createdAt – user creation date
 * @property {string} updatedAt – user update date
 * @property {string} onlineStatus – user online status
 */

/**
 * @typedef {Object.<string, User>} UserCollection
 */

/**
 * User state
 * @returns {UserState}
 */
const state = () => {
  /**
   * @namespace UserState
   */
  return {
    /**
     * @type UserCollection
     */
    collection: {},
  };
};

export default state();
