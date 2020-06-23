import axios from 'axios';

/**
 * Get full state of a certain workspace
 * @param {string} id - workspace id
 *
 * @returns {object} result data
 *
 *  @returns {object} data.workspace
 *   @returns {string} data.workspace.id
 *   @returns {string} data.workspace.name
 *   @returns {string} data.workspace.avatar
 *   @returns {date} data.workspace.createdAt
 *   @returns {date} data.workspace.updatedAt
 *   @returns {object} data.workspace.user
 *    @returns {string} data.workspace.user.role
 *
 *   @returns {array} data.channels
 *    @returns {string} data.channels[el].id
 *    @returns {string} data.channels[el].name
 *    @returns {string} data.channels[el].description
 *    @returns {boolean} data.channels[el].isPrivate
 *    @returns {boolean} data.channels[el].isTemporary
 *    @returns {date} data.channels[el].expiredAt
 *    @returns {date} data.channels[el].createdAt
 *    @returns {date} data.channels[el].updatedAt
 *    @returns {string} data.channels[el].role
 *
 *    @returns {array} data.channels[el].users
 *     @returns {boolean} data.channels[el].users[el].microphone
 *     @returns {boolean} data.channels[el].users[el].speakers
 *     @returns {boolean} data.channels[el].users[el].screen
 *     @returns {boolean} data.channels[el].users[el].camera
 *     @returns {boolean} data.channels[el].users[el].speaking
 *     @returns {string} data.channels[el].users[el].userId
 *
 *    @returns {array} data.users
 *     @returns {string} data.users[el].id
 *     @returns {string} data.users[el].name
 *     @returns {string} data.users[el].avatar
 *     @returns {string} data.users[el].email
 *     @returns {boolean} data.users[el].isEmailVerified
 *     @returns {date} data.users[el].createdAt
 *     @returns {date} data.users[el].updatedAt
 *     @returns {string} data.users[el].onlineStatus
 *     @returns {string} data.users[el].timeZone
 */
export default async function (id) {
  const res = await axios.get(`/workspaces/${id}`);

  return res.data;
}
