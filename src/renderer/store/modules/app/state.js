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
 * @property {boolean} devices.webcams – web cameras
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
    devices: { // TODO: get real devices here
      speakers: [ {
        name: 'Speaker 1',
        value: '1',
      }, {
        name: 'Speaker 2',
        value: '2',
      } ],
      microphones: [ {
        name: 'Microphone 1',
        value: '1',
      }, {
        name: 'Microphone 2',
        value: '2',
      } ],
      webcams: [ {
        name: 'Camera 1',
        value: '1',
      }, {
        name: 'Camera 2',
        value: '2',
      } ],
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
