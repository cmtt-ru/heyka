import axios from 'axios';

/**
 * Sign up user with email and password
 * @param {object} params - params
 * @param {object} params.user - user
 * @param {string} params.user.name - name
 * @param {string} params.user.avatar - avatar
 * @param {string} params.user.email - email
 * @param {string} params.user.password - password
 *
 * @returns {object} result.user
 * @returns {string} user.id
 * @returns {string} user.name
 * @returns {string} user.avatar
 * @returns {string} user.email
 * @returns {boolean} user.isEmailVerified
 * @returns {date} user.createdAt
 * @returns {date} user.updatedAt
 * @returns {object} user.facebookAuth
 * @returns {string} user.facebookAuth.id
 * @returns {object} user.googleAuth
 * @returns {string} user.googleAuth.id
 * @returns {object} user.slackAuth
 * @returns {string} user.slackAuth.id
 * @returns {object} user.credentials
 * @returns {string} user.credentials.accessToken
 * @returns {string} user.credentials.refreshToken
 * @returns {date} user.credentials.accessTokenExpiredAt
 * @returns {date} user.credentials.refreshTokenExpiredAt
 */
export default function (params) {
  return axios.post('/signup', params);
}