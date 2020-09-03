import axios from 'axios';

/**
 * Upload speed test. upload arbitrary 20KB
 * @param {object} params - any ind of data with any property.
 *                          acccepts multipart/form-data
 *
 * @returns {object} result data
 */
export default async function (params) {
  const res = await axios.post(`/speedtest`, params);

  return res.data;
}
