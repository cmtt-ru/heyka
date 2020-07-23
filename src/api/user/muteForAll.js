import axios from 'axios';
import { client } from '@api/socket/client';

/**
 * Select a certain channel
 * @param {string} userId - user id
 *
 * @returns {object} response
 */
export default function (userId) {
  return axios.post(`/mute-for-all?socketId=${client.id}`, { userId }).then(res => res.data);
}
