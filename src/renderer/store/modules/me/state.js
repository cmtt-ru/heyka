import { meStore } from '@/store/localStore';

/**
 * @typedef {object} MeState
 * @property {string} id – my id
 * @property {string} email – user id
 * @property {string} selectedWorkspaceId – selected workspace id
 * @property {string} selectedChannelId – selected channel id
 * @property {MediaState} mediaState – my media state
 * @property {MediaState} previousMediaState – my previous media state
 * @property {array} pokes – list of pokes
 * @property {string} onlineStatus – online status
 * @property {string} previousOnlineStatus – previous online status
 * @property {boolean} suspendState – sleep / awake state
 * @property {boolean} lockScreenState – screen lock / unlock state
 * @property {boolean} allowDraw – Allow/forbid drawing
 * @property {object} socialAuth – social accounts
 */

/**
 * Me state
 * @returns {MeState}
 */
const state = () => {
  /**
   * @type MediaState
   */
  const initialMediaState = {
    microphone: meStore.getSync('microphone', false),
    speakers: true,
    screen: false,
    camera: false,
    speaking: false,
  };

  const onlineStatus = meStore.getSync('onlineStatus', 'online');

  /**
   * @namespace MeState
   */
  return {
    id: null,
    email: null,
    selectedWorkspaceId: meStore.getSync('selectedWorkspaceId'),
    selectedChannelId: null,
    mediaState: initialMediaState,
    previousMediaState: initialMediaState,
    pokes: [],
    onlineStatus: onlineStatus,
    previousOnlineStatus: onlineStatus,
    suspendState: false,
    lockScreenState: false,
    allowDraw: true,
    socialAuth: {},
  };
};

export default state();
