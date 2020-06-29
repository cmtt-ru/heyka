import axios from 'axios';
import { client } from '@api/socket/client';

/**
 * Select a certain channel
 * @param {string} id - channel's id
 * @param {object} mediaState - our mediastate
 * @param {boolean} mediaState.microphone - microphone
 * @param {boolean} mediaState.speakers - speakers
 * @param {boolean} mediaState.screen - screen
 * @param {boolean} mediaState.camera - camera
 * @param {boolean} mediaState.speaking - speaking
 *
 * @returns {object} data.connectionOptions
 * @returns {string} connectionOptions.janusServerUrl
 * @returns {string} connectionOptions.janusAuthToken
 * @returns {number} connectionOptions.audioRoomId
 * @returns {number} connectionOptions.videoRoomId
 * @returns {string} connectionOptions.channelAuthToken
 */
export default function (id, mediaState) {
  return axios.post(`/channels/${id}/select?socketId=${client.id}`, mediaState).then(res => res.data);
}
