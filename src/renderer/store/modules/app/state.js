import { remote } from 'electron';
import Store from 'electron-store';

const heykaStore = new Store({
  name: 'app',
});

/**
 * @typedef {object} AppState
 * @property {string} appName – app name
 * @property {string} appVersion – app version
 * @property {string} language – language
 * @property {string} runAppFrom – run from tray or dock
 * @property {boolean} autorun – autorun
 * @property {boolean} collectAnalytics – whether to collect analytics
 * @property {array} privacyLogs – privacy logs
 *
 * @property {object} theme – color theme
 * @property {string} theme.name – theme name
 * @property {boolean} theme.auto – theme auto choose
 *
 * @property {object} devices – list of user devices
 * @property {boolean} devices.speakers – speakers
 * @property {boolean} devices.microphones – microphones
 * @property {boolean} devices.cameras – web cameras
 *
 * @property {object} selectedDevices – list of selected devices
 * @property {string} selectedDevices.speaker – selected speaker
 * @property {string} selectedDevices.microphone – selected microphone
 * @property {string} selectedDevices.camera – selected camera
 */

/**
 * App state
 * @returns {AppState}
 */
const state = () => {
  /**
   * @namespace AppState
   */
  return {
    uniqueId: 1,
    appName: 'Heyka Desktop',
    appVersion: remote.app.getVersion(),
    language: heykaStore.get('language', 'en'),
    runAppFrom: heykaStore.get('runAppFrom', 'window'),
    runAppFromOld: heykaStore.get('runAppFrom', 'window'),
    autorun: heykaStore.get('autorun', true),
    theme: heykaStore.get('theme', {
      name: 'light',
      auto: true,
    }),
    devices: {
      speakers: [],
      microphones: [],
      cameras: [],
    },
    selectedDevices: {
      speaker: heykaStore.get('selectedSpeaker', 'default'),
      microphone: heykaStore.get('selectedMicrophone', 'default'),
      camera: heykaStore.get('selectedCamera', ''),
    },
    collectAnalytics: heykaStore.get('collectAnalytics', true),
    privacyLogs: [],
    notifications: [ {
      id: '1221',
      text: 'TestTest',
    } ],
  };
};

export default state();
