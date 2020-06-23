import axios from 'axios';

/**
 * Leave the channel
 * @param {string} id - channel's id
 *
 * @returns {string} "ok"
 */
export default function (id) {
  return axios.post(`/channels/${id}/leave`);
}