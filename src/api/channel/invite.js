import axios from 'axios';

/**
 * Create invite token to specific channel
 * @param {string} id - id of channel
 * @returns {string} 'ok'
 */
export default async function (id) {
  const res = await axios.post(`/channels/${id}/invite`);

  return res.data;
}
