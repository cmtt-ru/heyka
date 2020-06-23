import axios from 'axios';

/**
 * Send PUSH NOTIFICATION RESPONSE to user
 * @param {object} params - params
 * @param {string} params.messageId - id of message to reply to
 * @param {object} params.response - object with any kind of message response
 *
 * @returns {string} 'ok'
 */
export default async function (params) {
  const res = await axios.post(`/message-response`, params);

  return res.data;
}