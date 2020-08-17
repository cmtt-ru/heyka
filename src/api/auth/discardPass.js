import axios from 'axios';

/**
 * Sent "password reset" email
 *
 * @param {object} params - params
 *  @param {string} params.email - email
 *
 * @returns {string} ok
 */
export default function (params) {
  return axios.post('/reset-password/init', params).then(res => res.data);
}
