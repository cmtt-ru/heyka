import API from '@api';
import themes from '@/themes';
import pushWindow from '@classes/pushWindow';
import i18n from '@/i18n';
import { ipcRenderer } from 'electron';
import dateFormat from 'dateformat';
import { v4 as uuidV4 } from 'uuid';
import { heykaStore } from '@/store/localStore';
import sounds from '@classes/sounds';

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
   * Add new in-app notification
   *
   * @param {function} commit – store commit
   * @param {object} notif – notification
   * @returns {string} id
   */
  addNotification({ commit }, notif) {
    const id = uuidV4();
    const notification = {
      id,
      ...notif,
    };

    commit('ADD_NOTIFICATION', notification);

    return id;
  },

  /**
   * Remove in-app notification by ID
   *
   * @param {function} commit – store commit
   * @param {string} id – notification id
   * @returns {void}
   */
  removeNotification({ commit }, id) {
    commit('REMOVE_NOTIFICATION', id);
  },

  /**
   * Send push
   *
   * @param {function} commit – store commit
   * @param {object} notif – push
   * @returns {string} id
   */
  async sendPush({ rootGetters }, { userId, isResponseNeeded = false, message }) {
    if (rootGetters['me/getMyId'] === userId) {
      return;
    }
    const { messageId } = await API.user.sendMessage({
      userId,
      isResponseNeeded,
      message,
    });

    return messageId;
  },

  /**
   * Send push response
   *
   * @param {function} commit – store commit
   * @param {object} notif – push
   * @returns {string} id
   */
  async sendPushResponse({ commit, state }, { response, messageId }) {
    await API.user.sendMessageResponse({
      messageId,
      response,
    });
  },

  /**
   * Add new push
   *
   * @param {function} commit – store commit
   * @param {object} notif – push
   * @returns {string} id
   */
  addPush({ commit }, { messageId, userId, message }) {
    const push = {
      messageId,
      userId,
      ...message,
    };

    commit('ADD_PUSH', push);
    pushWindow.addPush();
  },

  /**
   * Remove push by ID
   *
   * @param {function} commit – store commit
   * @param {string} id – push's id
   * @returns {void}
   */
  removePush({ commit }, id) {
    commit('REMOVE_PUSH', id);
    pushWindow.removePush();
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

    sounds.setSinkId(selectedDevices.speaker);
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
