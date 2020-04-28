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
   * Get OLD mode state (to see if it will change after restart)
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getModeWillChange: (state) => {
    return (state.runAppFromOld !== state.runAppFrom);
  },
};
