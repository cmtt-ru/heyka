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
 * @property {string} sharingSourceId – sharing source id
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

  /**
   * @namespace MeState
   */
  return {
    id: '',
    selectedWorkspaceId: meStore.get('selectedWorkspaceId'),
    selectedChannelId: '',
    mediaState: initialMediaState,
    pokes: [],
    sharingSourceId: null,
  };
};

export default state();
