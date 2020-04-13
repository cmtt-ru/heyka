const state = () => {
  return {
    /**
     * Janus server url
     * @type {string}
     */
    janusServerUrl: '',

    /**
     * Janus auth token
     * @type {string}
     */
    janusAuthToken: '',

    /**
     * Channel auth token
     * @type {string}
     */
    channelAuthToken: '',

    /**
     * Janus audio room id
     * @type {number}
     */
    audioRoomId: 0,

    /**
     * Janus video room id
     * @type {number}
     */
    videoRoomId: 0,
  };
};

export default state();
