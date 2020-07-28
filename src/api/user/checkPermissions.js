import axios from 'axios';

/**
 * Check user permissions
 * @param {PermissionsData} data - permission data
 * @returns {object}
 */
export default async function (data) {
  const res = await axios.get(`/check-persmissions`, {
    params: data,
  });

  return res.data;
}
