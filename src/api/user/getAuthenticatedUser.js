import axios from 'axios';

/**
 * Get authenticated user
 *
 * @returns {object} result data
 * @returns {string} data.id
 * @returns {string} data.name
 * @returns {string} data.avatar
 * @returns {string} data.email
 * @returns {boolean} data.isEmailVerified
 * @returns {date} data.createdAt
 * @returns {date} data.updatedAt
 */
export default function () {
  return axios.get('/me').then(res => res.data);
}
