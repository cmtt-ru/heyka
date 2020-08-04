import axios from 'axios';

/**
 * Generate temporary auth code
 * @returns {object}
 */
export default function () {
  return axios.post('/create-auth-link').then(res => res.data);
}
