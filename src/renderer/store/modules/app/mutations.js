/**
 * Max length of privacy log array
 * @type {number}
 */
const PRIVACY_LOG_MAX_LENGTH = 100;

export default {
  /**
   * Add privacy log
   *
   * @param {AppState} state – vuex state
   * @param {string} logEntry — log entry
   * @constructor
   */
  ADD_PRIVACY_LOG(state, logEntry) {
    state.privacyLogs.push(logEntry);
    state.privacyLogs = state.privacyLogs.slice(-PRIVACY_LOG_MAX_LENGTH);
  },

  /**
   * Set app language
   *
   * @param {AppState} state – module app state
   * @param {string} language – new language identifier
   * @constructor
   */
  SET_LANGUAGE(state, language) {
    state.language = language;
  },

  /**
   * Set app mode (window/tray)
   *
   * @param {AppState} state – module app state
   * @param {string} mode – new mode identifier
   * @constructor
   */
  SET_MODE(state, mode) {
    state.runAppFrom = mode;
  },

  /**
   * Set app autorun state
   *
   * @param {AppState} state – module app state
   * @param {string} autorun – new autorun state
   * @constructor
   */
  SET_AUTORUN(state, autorun) {
    state.autorun = autorun;
  },

  /**
   * Set app theme
   *
   * @param {AppState} state – module app state
   * @param {string} theme – new theme identifier
   * @constructor
   */
  SET_THEME(state, theme) {
    state.theme = theme;
  },

  /**
   * Set app collectAnalytics mode
   *
   * @param {AppState} state – module app state
   * @param {string} collectAnalytics – new collectAnalytics mode
   * @constructor
   */
  SET_ANALYTICS(state, collectAnalytics) {
    state.collectAnalytics = collectAnalytics;
  },

  /**
   * Add new notification
   *
   * @param {AppState} state – module app state
   * @param {object} notif – new notification
   * @constructor
   */
  ADD_NOTIFICATION(state, notif) {
    state.notifications.push(notif);
  },

  /**
   * Remove notification by id
   *
   * @param {AppState} state – module app state
   * @param {string} id id
   * @constructor
   */
  REMOVE_NOTIFICATION(state, id) {
    state.notifications = state.notifications.filter(el => el.id != id);
  },

  /**
   * Add new push
   *
   * @param {AppState} state – module app state
   * @param {object} notif – new push
   * @constructor
   */
  ADD_PUSH(state, notif) {
    state.pushes.push(notif);
  },

  /**
   * Remove push by id
   *
   * @param {AppState} state – module app state
   * @param {string} id id
   * @constructor
   */
  REMOVE_PUSH(state, id) {
    state.pushes = state.pushes.filter(el => el.messageId != id);
  },

  /**
   * Set device list
   *
   * @param {AppState} state – module app state
   * @param {object} devices – list of devices
   * @constructor
   */
  SET_DEVICES(state, devices) {
    state.devices = devices;

    if (!state.selectedDevices.camera && devices.cameras.length > 0) {
      state.selectedDevices.camera = devices.cameras[0].id;
    }
  },

  /**
   * Set selected devices
   *
   * @param {AppState} state – module app state
   * @param {object} devices – list of selected devices
   * @constructor
   */
  SET_SELECTED_DEVICES(state, devices) {
    state.selectedDevices = devices;
  },

  /**
   * Set microphone volume
   *
   * @param {AppState} state – module app state
   * @param {number} volume – new microphone volume
   * @constructor
   */
  SET_MICROPHONE_VOLUME(state, volume) {
    state.microphoneVolume = volume;
  },

  /**
   * Set search text
   *
   * @param {AppState} state – module app state
   * @param {string} text – new search text
   * @constructor
   */
  SET_SEARCH_TEXT(state, text) {
    state.search = text;
  },

};
