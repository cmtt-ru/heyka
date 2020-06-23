import axios from 'axios';
import { client } from '@api/socket/client';

/**
 * Change state of the user
 * @param {object} mediaState - params
 * @param {boolean} mediaState.microphone - microphone
 * @param {boolean} mediaState.speakers - speakers
 * @param {boolean} mediaState.screen - screen
 * @param {boolean} mediaState.camera - camera
 * @param {boolean} mediaState.speaking - speaking
 *
 * @returns {string} 'ok'
 */
export default function (mediaState) {
  return axios.post(`/user/media-state?socketId=${client.id}`, mediaState);
}
