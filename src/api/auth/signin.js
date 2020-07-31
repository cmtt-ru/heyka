import axios from 'axios';
import { setTokens } from '../tokens';

/**
 * Sign in user with email and password
 * @param {object} params - params
 *  @param {object} params.credentials - credentials object
 *   @param {string} params.credential.email - email
 *   @param {string} params.credentials.password - password
 *
 * @returns {object} result user
 *  @returns {string} user.id
 *  @returns {string} user.name
 *  @returns {string} user.avatar
 *  @returns {string} user.email
 *  @returns {boolean} user.isEmailVerified
 *  @returns {date} user.createdAt
 *  @returns {date} user.updatedAt
 *  @returns {object} user.facebookAuth
 *   @returns {string} user.facebookAuth.id
 *  @returns {object} user.googleAuth
 *   @returns {string} user.googleAuth.id
 *  @returns {object} user.slackAuth
 *   @returns {string} user.slackAuth.id
 *  @returns {object} user.credentials
 *   @returns {string} user.credentials.accessToken
 *   @returns {string} user.credentials.refreshToken
 *   @returns {date} user.credentials.accessTokenExpiredAt
 *   @returns {date} user.credentials.refreshTokenExpiredAt
 */
export default async function (params) {
  const res = await axios.post('/signin', params);

  setTokens(res.data.credentials);

  return res;
}