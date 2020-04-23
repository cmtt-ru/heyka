import themes from '@/themes';
import i18n from '@/i18n';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

const heykaStore = new Store({
  name: 'app',
});

export default {

  /**
   * Set app language
   *
   * @param {function} commit – store commit
   * @param {string} language – app language
   * @returns {void}
   */
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language);
    i18n.locale = language;
    heykaStore.set('language', language);
  },
  /**
   * Set mode (window/tray)
   *
   * @param {function} commit – store commit
   * @param {string} mode – app mode (window/tray)
   * @returns {void}
   */
  setMode({ commit }, mode) {
    commit('SET_MODE', mode);
    heykaStore.set('runAppFrom', mode);
  },
  /**
   * Set app autorun state
   *
   * @param {function} commit – store commit
   * @param {string} autorun – app autorun state
   * @returns {void}
   */
  setAutorun({ commit }, autorun) {
    ipcRenderer.send('app-toggle-autolaunch', autorun);
    commit('SET_AUTORUN', autorun);
    heykaStore.set('autorun', autorun);
  },
  /**
   * Set app theme
   *
   * @param {function} commit – store commit
   * @param {string} theme – app theme
   * @returns {void}
   */
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme);
    if (theme.auto) {
      themes.autoSetTheme();
    } else {
      themes.manualSetTheme(theme.name);
    }
    heykaStore.set('theme', theme);
  },

  /**
   * Set app collectAnalytics mode
   *
   * @param {function} commit – store commit
   * @param {string} collectAnalytics – app collectAnalytics
   * @returns {void}
   */
  setAnalytics({ commit }, collectAnalytics) {
    commit('SET_ANALYTICS', collectAnalytics);
    heykaStore.set('collectAnalytics', collectAnalytics);
  },

};
