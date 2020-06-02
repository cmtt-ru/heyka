import themes from '@/themes';
import i18n from '@/i18n';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import dateFormat from 'dateformat';
import { v4 as uuidV4 } from 'uuid';

const heykaStore = new Store({
  name: 'app',
});

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

  /**
   * Add notification
   *
   * @param {function} commit – store commit
   * @param {object} options – notification options
   * @returns {string} id – notification id
   */
  addNotification({ commit }, options) {
    const id = uuidV4();
    const notification = {
      id,
      ...options,
    };

    commit('ADD_NOTIFICATION', notification);

    return id;
  },

  /**
   * Remove notification
   *
   * @param {function} commit – store commit
   * @param {string} id – notification id
   * @returns {void}
   */
  removeNotification({ commit }, id) {
    commit('REMOVE_NOTIFICATION', id);
  },

  /**
   * Set selected devices
   *
   * @param {function} commit – store commit
   * @param {object} selectedDevices – selected devices
   * @returns {void}
   */
  setSelectedDevices({ commit }, selectedDevices) {
    commit('SET_SELECTED_DEVICES', selectedDevices);

    heykaStore.set('selectedSpeaker', selectedDevices.speaker);
    heykaStore.set('selectedMicrophone', selectedDevices.microphone);
    heykaStore.set('selectedCamera', selectedDevices.camera);
  },

  /**
   * Set microphone volume
   *
   * @param {function} commit – store commit
   * @param {number} volume – microphone volume
   * @returns {void}
   */
  setMicrophoneVolume({ commit }, volume) {
    const quietestVolume = -100;
    const loudestVolume = 0;

    if (volume < quietestVolume) {
      volume = quietestVolume;
    }
    if (volume > loudestVolume) {
      volume = loudestVolume;
    }
    commit('SET_MICROPHONE_VOLUME', volume);
  },
};
