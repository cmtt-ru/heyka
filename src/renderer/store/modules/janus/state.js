/**
 * @typedef {object} JanusState
 * @param {string} janusServerUrl – janus server url
 * @param {string} janusWsServerUrl – janus websocket server url
 * @param {string} janusAuthToken – janus auth token
 * @param {string} channelAuthToken – channel auth token
 * @param {number} audioRoomId – janus audio room id
 * @param {number} videoRoomId – janus video room id
 * @param {object} sharingSource – sharing source
 * @param {boolean} inProgress – is janus in an operation progress
 */

/**
 * App state
 * @returns {JanusState}
 */
const state = () => {
  /**
   * @namespace JanusState
   */
  return {
    janusServerUrl: '',
    janusWsServerUrl: '',
    janusAuthToken: '',
    channelAuthToken: '',
    audioRoomId: 0,
    videoRoomId: 0,
    sharingSource: null,
    inProgress: false,
  };
};

export default state();
