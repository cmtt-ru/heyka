export default {

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

};
