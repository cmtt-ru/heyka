import axios from 'axios';

/**
 * Get active users list of this channel with media states
 * @param {string} id - channel's id
 *
 * @returns {array} array of user's states
 * @returns {boolean} data[el].microphone
 * @returns {boolean} data[el].speakers
 * @returns {boolean} data[el].screen
 * @returns {boolean} data[el].camera
 * @returns {boolean} data[el].speaking
 * @returns {string} data[el].userId
 */
export default function (id) {
  return axios.get(`/channels/${id}/active-users`);
}