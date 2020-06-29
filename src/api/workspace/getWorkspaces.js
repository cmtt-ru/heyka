import axios from 'axios';

/**
 * Get list of your workspaces
 *
 * @returns {array} result data
 *  @returns {string} data[el].id
 *  @returns {string} data[el].name
 *  @returns {string} data[el].avatar
 *  @returns {date} data[el].createdAt
 *  @returns {date} data[el].updatedAt
 */
export default async function () {
  const res = await axios.get('/workspaces');

  return res.data;
}