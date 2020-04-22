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

};
