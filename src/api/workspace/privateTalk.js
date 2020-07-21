import axios from 'axios';

/**
 * Create private temporary channel in a certain workspace
 * @param {string} id - id of workspace
 * @param {object} params - private talk params
 * @param {array} params.users - user ids
 * @returns {object} channel
 */
export default async function (id, params) {
  const res = await axios.post(`/workspaces/${id}/private-talk`, params);

  return res.data;
}
