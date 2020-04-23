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
      webcams: [],
    },
    collectAnalytics: heykaStore.get('collectAnalytics', true),
  };
};

export default state();
