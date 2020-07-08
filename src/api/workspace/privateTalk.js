import axios from 'axios';

/**
 * Create channel in a certain workspace
 * @param {string} id - id of workspace
 * @param {object} params - private talk params
 * @param {array} params.users - user ids
 * @returns {string} 'ok'
 */
export default function (id, params) {
  const res = axios.post(`/workspaces/${id}/private-talk`, params);

  return res.data;
}
