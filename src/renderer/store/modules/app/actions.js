import dateFormat from 'dateformat';

/**
 * @typedef PrivacyLogData
 * @property {string} category – category, e.g. API or SOCKET
 * @property {string} method – method name, e.g. getWorkspaces
 * @property {object} data – data sent, e.g. {userId: '...'}
 */

export default {
  /**
   * Add privacy log
   *
   * @param {function} commit – store commit
   * @param {PrivacyLogData} logData – log data
   * @returns {void}
   */
  addPrivacyLog({ commit }, logData) {
    const date = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
    const dataSent = JSON.stringify(logData.data);
    const logEntry = `[${date}][${logData.category.toUpperCase()}] ${logData.method}, ${dataSent}`;

    commit('ADD_PRIVACY_LOG', logEntry);
  },

};
