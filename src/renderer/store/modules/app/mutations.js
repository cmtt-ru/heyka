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
   * Set microphone volume
   *
   * @param {AppState} state – module app state
   * @param {number} volume – new microphone volume
   * @constructor
   */
  SET_MICROPHONE_VOLUME(state, volume) {
    state.microphoneVolume = volume;
  },

};
