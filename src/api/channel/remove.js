import axios from 'axios';

/**
 * Delete channel
 * @param {string} id - channel id
 * @returns {string} 'ok'
 */
export default async function (id) {
  const res = await axios.delete(`/channels/${id}`);

  return res.data;
}
