import axios from 'axios';

/**
 * Detach social network
 *
 * @param {string} socialName - facebook/google/slack
 * @returns {object} result data
 */
export default function (socialName) {
  return axios.get(`/detach-account/${socialName}`).then(res => res.data);
}
