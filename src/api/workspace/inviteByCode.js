import axios from 'axios';

/**
 * Create invite in a certain workspace
 * @param {string} id - workspace id
 *
 * @returns {string} result string
 */
export default function (id) {
  const res = axios.post(`/workspaces/${id}/invites`);

  return res.data;
}