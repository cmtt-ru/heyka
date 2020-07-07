import axios from 'axios';

/**
 * Send invite to a user by Slack
 * @param {string} id - workspace id
 * @param {string} slackUserId - slackUserId
 *
 * @returns {string} result string
 */
export default function (id, slackUserId) {
  const res = axios.post(`/workspaces/${id}/invite/slack`, { slackUserId });

  return res.data;
}