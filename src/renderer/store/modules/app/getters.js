import OS from 'os';

export default {
  /**
   * Get general app info (name, ver, operating system etc.)
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getGeneralInfo: (state) => {
    return {
      name: state.appName,
      version: state.appVersion,
      system: OS.type(), // TODO: make prettier
      systemVer: OS.release(),
    };
  },

  /**
   * Get current Language
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getLang: (state) => state.language,
  /**
   * Get current mode (window/tray)
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getMode: (state) => state.runAppFrom,
  /**
   * Get OLD mode state (to see if it will change after restart)
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getOldMode: (state) => state.runAppFromOld,
  /**
   * Get current autorun state
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getAutorun: (state) => state.autorun,
  /**
   * Get current theme
   *
   * @param {AppState} state – module app state
   * @returns {object}
   */
  getTheme: (state) => state.theme,
  /**
   * Get current collectAnalytics state
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getAnalytics: (state) => state.collectAnalytics,

};
