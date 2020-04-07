const state = () => {
  return {
    /**
     * Janus server url
     * @type {string}
     */
    url: '',

    /**
     * Janus workspace token
     * @type {string}
     */
    workspaceToken: '',

    /**
     * Janus channel token
     * @type {string}
     */
    channelToken: '',

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
