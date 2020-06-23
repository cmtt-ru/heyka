import axios from 'axios';

/**
 * Update client's refresh and access tokens
 * @param {object} params - params
 *  @param {string} params.accessToken - old access token
 *  @param {string} params.refreshToken - old refresh token
 *
 * @returns {object} result data
 *  @returns {string} data.accessToken — new access token
 *  @returns {string} data.refreshToken — new access token
 *  @returns {date} data.accessTokenExpiredAt — new access token's exiring date
 *  @returns {date} data.refreshTokenExpiredAt — new access token's exiring date
 */
export default function (params) {
  return axios.post('/refresh-token', params).then(res => res.data);
}