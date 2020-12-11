/**
 * @typedef {object} Channel
 * @property {string} id – channel id
 * @property {string} name – channel name
 * @property {string} description – channel description
 * @property {boolean} isPrivate – private status
 * @property {boolean} isTemporary – temporary status
 * @property {string} createdAt – creation date
 * @property {string} updatedAt – update date
 * @property {MediaState[]} users – array of user's media state
 * @property {object} conversationData – conversation data grouped by user id
 * @property {array} conversationEvents – conversation events
 */

/**
 * @typedef {object} MediaState
 * @property {string} [userId] – user id
 * @property {boolean} camera – is web camera enabled
 * @property {boolean} microphone – is microphone enabled
 * @property {boolean} screen – is screen sharing enabled
 * @property {boolean} speakers – is speakers enabled
 * @property {boolean} speaking – is user speaking
 */

/**
 * @typedef {Object.<string, Channel>} ChannelCollection
 */

/**
 * Channel state
 * @returns {ChannelState}
 */
const state = () => {
  /**
   * @namespace ChannelState
   */
  return {
    /**
     * @type ChannelCollection
     */
    collection: {},
  };
};

export default state();
