import Store from 'electron-store';

const meStore = new Store({
  name: 'store-module-me',
});

/**
 * @typedef {object} MeState
 * @property {string} id – my id
 * @property {string} selectedWorkspaceId – selected workspace id
 * @property {string} selectedChannelId – selected channel id
 * @property {MediaState} mediaState – my media state
 * @property {array} pokes – list of pokes
 * @property {string} onlineStatus – online status
 * @property {string} previousOnlineStatus – previous online status
 */

/**
 * Me state
 * @returns {MeState}
 */
const state = () => {
  /**
   * @type MediaState
   */
  const initialMediaState = meStore.get('mediaState', {
    microphone: false,
    speakers: false,
    screen: false,
    camera: false,
    speaking: false,
  });

  const onlineStatus = meStore.get('onlineStatus', 'online');

  /**
   * @namespace MeState
   */
  return {
    id: '',
    selectedWorkspaceId: meStore.get('selectedWorkspaceId'),
    selectedChannelId: null,
    mediaState: initialMediaState,
    pokes: [],
    onlineStatus: onlineStatus,
    previousOnlineStatus: onlineStatus,
  };
};

export default state();
