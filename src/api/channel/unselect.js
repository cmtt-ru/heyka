import axios from 'axios';
import { client } from '@api/socket/client';

/**
 * Unselect a certain channel
 * @param {string} id - channel's id
 *
 * @returns {string} "ok"
 */
export default function (id) {
  return axios.post(`/channels/${id}/unselect?socketId=${client.id}`);
}
