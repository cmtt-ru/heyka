import axios from 'axios';

/**
 * Leave the workspace
 * @param {object} id - workspace id
 *
 * @returns {string} result string
 */
export default function (id) {
  const res = axios.post(`/workspaces/${id}/leave`);

  return res.data;
}