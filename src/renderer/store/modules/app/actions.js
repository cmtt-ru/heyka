import Store from 'electron-store';
const appStore = new Store({
  name: 'app',
});

export default {

  /**
   * Set selected workspace id
   *
   * @param {function} commit – store commit
   * @param {string} language – app language
   * @returns {void}
   */
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language);
    appStore.set('language', language);
  },

};
