import axios from 'axios';

/**
 * Update user profile
 * @param {object} params - params
 * @param {string} params.name - new name
 * @param {string} params.avatarFileId - new avatar file id
 *
 * @returns {object} result data
 * @returns {string} data.id
 * @returns {string} data.name
 * @returns {string} data.avatarFileId
 * @returns {string} data.avatarSet
 * @returns {string} data.email
 * @returns {boolean} data.isEmailVerified
 * @returns {date} data.createdAt
 * @returns {date} data.updatedAt
 */
export default async function (params) {
  const res = await axios.post(`/profile`, params);

  return res.data;
}
