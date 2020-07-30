import axios from 'axios';

/**
 * Edit channel
 * @param {string} id - channel id
 * @param {string} params - channel info
 *  @param {string} params.name - channel name
 *  @param {string} params.isPrivate - is channel private
 *  @param {string} params.lifespan - channel lifespan (if it's temporary)
 * @returns {string} 'ok'
 */
export default async function (id, params) {
  const res = await axios.post(`/channels/${id}`, params);

  return res.data;
}
