import axios from 'axios';

/**
 * Check invite code
 * @param {string} code - invite code
 *
 * @returns {object} result data
 *  @returns {object} data.user
 *   @returns {string} data.user.id
 *   @returns {string} data.user.name
 *   @returns {string} data.user.avatar
 *   @returns {string} data.user.email
 *   @returns {boolean} data.user.isEmailVerified
 *   @returns {date} data.user.createdAt
 *   @returns {date} data.user.updatedAt
 *  @returns {object} data.workspace
 *   @returns {string} data.workspace.id
 *   @returns {string} data.workspace.name
 *   @returns {string} data.workspace.avatar
 *   @returns {date} data.workspace.createdAt
 *   @returns {date} data.workspace.updatedAt
 */
export default function (code) {
  const res = axios.get(`/check/${code}`);

  return res.data;
}