/**
 * @typedef PermissionsData
 * @property {array} actions – array of actions
 * @property {string} [userId] – user id
 * @property {string} [channelId] – channel id
 */

/**
 * Class for permissions
 */
class Permissions {
  /**
   * Permissions for edit/delete channel
   * @param {string} channelId – channel id
   * @returns {PermissionsData}
   */
  editChannel(channelId) {
    return {
      actions: ['channel.update', 'channel.delete'],
      channelId,
    };
  }
}

export default new Permissions();
