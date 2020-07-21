import axios from 'axios';

/**
 * Send PUSH NOTIFICATION to user
 * @param {object} params - params
 * @param {string} params.userId - id of recipient
 * @param {boolean} params.isResponseNeeded - id of recipient
 * @param {object} params.message - object with any kind of message
 *
 * @returns {object} result data
 * @returns {string} data.inviteId
 */
export default async function (params) {
  const res = await axios.post(`/send-invite`, params);

  return res.data;
}