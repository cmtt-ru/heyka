import axios from 'axios';

/**
 * Create channel in a certain workspace
 * @param {string} id - id of workspace
 * @param {string} params - channel info
 *  @param {string} params.name - channel name
 *  @param {string} params.isPrivate - is channel private
 *  @param {string} params.lifespan - channel lifespan (if it's temporary)
 *
 *
 * @returns {string} 'ok'
 */
export default async function (id, params) {
  const res = await axios.post(`/workspaces/${id}/channels`, params);

  return res.data;
}
