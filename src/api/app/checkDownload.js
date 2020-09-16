import axios from 'axios';

/**
 * Download random 20kb of data
 * @returns {string} result data
 */
export default function () {
  return axios.get('/speedtest').then(res => res.data);
}
