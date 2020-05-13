/**
 * @typedef {object} JanusState
 * @param {string} janusServerUrl – janus server url
 * @param {string} janusAuthToken – janus auth token
 * @param {string} channelAuthToken – channel auth token
 * @param {number} audioRoomId – janus audio room id
 * @param {number} videoRoomId – janus video room id
 * @param {string} sharingSourceId – sharing source id
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
    janusAuthToken: '',
    channelAuthToken: '',
    audioRoomId: 0,
    videoRoomId: 0,
    sharingSourceId: null,
  };
};

export default state();
