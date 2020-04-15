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
 * @property {boolean} devices – list of user devices
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
   * @type AppState
   */
  return {
    appName: 'Heyka Desktop',
    appVersion: '1.1.4',
    language: 'en',
    runAppFrom: 'tray',
    autorun: true,
    theme: {
      name: 'Dark',
      auto: true,
    },
    devices: {
      speakers: [],
      microphones: [],
      webcams: [],
    },
    collectAnalytics: true,
  };
};

export default state();
