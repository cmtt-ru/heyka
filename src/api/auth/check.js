import axios from 'axios';

/**
 * Check connection
 * @returns {string} result data
 */
export default function () {
  return axios.get('/protected').then(res => res.data);
}
