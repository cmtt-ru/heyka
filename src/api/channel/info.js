import axios from 'axios';

/**
 * Select a certain channel
 * @param {string} id - channel's id
 * @returns {object} channelInfo – channel's info
 * @returns {string} channelInfo.id
 * @returns {string} channelInfo.creatorId
 * @returns {string} channelInfo.name
 * @returns {string} channelInfo.description
 * @returns {boolean} channelInfo.isPrivate
 * @returns {boolean} channelInfo.isTemporary
 * @returns {date} channelInfo.expiredAt
 * @returns {date} channelInfo.createdAt
 * @returns {date} channelInfo.updatedAt
 * @returns {date} channelInfo.creatorId
 */
export default function (id) {
  return axios.post(`/channels/${id}`).then(res => res.data);
}
