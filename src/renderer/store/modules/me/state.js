import Store from 'electron-store';

const meStore = new Store({
  name: 'store-module-me',
});

const state = () => {
  return {
    /**
     * Authorized user id
     * @type {string}
     */
    id: '',

    /**
     * Selected workspace id
     * @type {string}
     */
    selectedWorkspaceId: meStore.get('selectedWorkspaceId'),

    /**
     * Selected channel id
     * @type {string}
     */
    selectedChannelId: '',

    /**
     * Authorized user's media state
     * @type {{
     *   speaking: boolean,
     *   speakers: boolean,
     *   screen: boolean,
     *   microphone: boolean,
     *   camera: boolean
     * }}
     */
    mediaState: meStore.get('mediaState', {
      microphone: false,
      speakers: false,
      screen: false,
      camera: false,
      speaking: false,
    }),

    /**
     * Authorized user's pokes list
     * @type {array}
     */
    pokes: [],
  };
};

export default state();
