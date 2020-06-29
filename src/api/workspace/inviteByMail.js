import axios from 'axios';

/**
 * Send invite to a user by email
 * @param {string} id - workspace id
 * @param {string} email - email
 *
 * @returns {string} result string
 */
export default function (id, email) {
  const res = axios.post(`/workspaces/${id}/invite/email`, { email });

  return res.data;
}