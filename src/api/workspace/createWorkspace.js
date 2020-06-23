import axios from 'axios';

/**
 * Create workspace
 * @param {object} params - params
 * @param {string} params.name - worksace name
 * @param {string} params.avatar - worksace avatar
 *
 * @returns {object} result data
 *  @returns {object} data.workspace
 *   @returns {string} data.workspace.id
 *   @returns {string} data.workspace.name
 *   @returns {string} data.workspace.avatar
 *   @returns {date} data.workspace.createdAt
 *   @returns {date} data.workspace.updatedAt
 *   @returns {object} data.workspace.user
 *    @returns {string} data.workspace.user.role  - eg. "admin"
 */
export default function (params) {
  const res = axios.post('/workspaces', params);

  return res.data;
}