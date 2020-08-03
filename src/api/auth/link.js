import axios from 'axios';

/**
 * Generate temporary auth code
 * @returns {object}
 */
export default function () {
  return axios.post('/auth-link').then(res => res.data);
}
