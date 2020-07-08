import axios from 'axios';

/**
 * Select a certain channel
 * @param {string} id - channel's id
 * @returns {object} channelInfo – channel info
 * @returns {string} channelInfo.channels[el].id
 * @returns {string} channelInfo.channels[el].name
 * @returns {string} channelInfo.channels[el].description
 * @returns {boolean} channelInfo.channels[el].isPrivate
 * @returns {boolean} channelInfo.channels[el].isTemporary
 * @returns {date} channelInfo.channels[el].expiredAt
 * @returns {date} channelInfo.channels[el].createdAt
 * @returns {date} channelInfo.channels[el].updatedAt
 */
export default function (id) {
  return axios.post(`/channels/${id}`).then(res => res.data);
}
