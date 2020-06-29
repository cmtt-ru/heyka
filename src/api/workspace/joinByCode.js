import axios from 'axios';

/**
 * Join to the workspace by an invite code
 * @param {string} code - invite code
 *
 * @returns {string} result string
 */
export default function (code) {
  const res = axios.post(`/join/${code}`);

  return res.data;
}