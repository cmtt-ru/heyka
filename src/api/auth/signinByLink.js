import axios from 'axios';
import { setTokens } from '../tokens';

/**
 * Creates credential tokens by authorization link
 * @param {string} code - authorization link
 *
 * @returns {object} result data
 * @returns {string} data.accessToken — new access token
 * @returns {string} data.refreshToken — new access token
 * @returns {date} data.accessTokenExpiredAt — new access token's exiring date
 * @returns {date} data.refreshTokenExpiredAt — new access token's exiring date
 */
export default async function (code) {
  const res = await axios.post(`/signin/link/${code}`);

  setTokens(res.data);

  return res;
}
