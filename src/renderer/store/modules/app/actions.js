import API from '@api';
import themes from '@sdk/themes';
import i18n from '@sdk/translations/i18n';
import { ipcRenderer } from 'electron';
import dateFormat from 'dateformat';
import { v4 as uuidV4 } from 'uuid';
import { heykaStore } from '@/store/localStore';
import sounds from '@sdk/classes/sounds';

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
   * Set muteMic mode
   *
   * @param {function} commit – store commit
   * @param {string} muteMic – app muteMic mode
   * @returns {void}
   */
  setMuteMic({ commit }, muteMic) {
    commit('SET_MUTE_MIC', muteMic);
    heykaStore.set('muteMic', muteMic);
  },

  /**
   * Set closeOverlayButton mode
   *
   * @param {function} commit – store commit
   * @param {string} closeOverlayButton – app closeOverlayButton mode
   * @returns {void}
   */
  setCloseOverlayButton({ commit }, closeOverlayButton) {
    commit('SET_CLOSE_OVERLAY_BUTTON', closeOverlayButton);
    heykaStore.set('closeOverlayButton', closeOverlayButton);
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

    const workspaceId = rootGetters['me/getSelectedWorkspaceId'];

    const { inviteId } = await API.user.sendInvite({
      userId,
      workspaceId,
      channelId: message.channelId,
      isResponseNeeded,
      message,
    });

    return inviteId;
  },

  /**
   * Send push response
   *
   * @param {function} commit – store commit
   * @param {object} notif – push
   * @returns {string} id
   */
  async sendPushResponse({ commit, state }, { response, inviteId }) {
    await API.user.sendInviteResponse({
      inviteId,
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
  addPush({ commit }, { inviteId, userId, message }) {
    const push = {
      inviteId,
      userId,
      ...message,
    }; // TODO: брать workspaceId из пришедшего пуша

    commit('ADD_PUSH', push);
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
  },

  /**
   * Set selected devices
   *
   * @param {object} vuex context
   * @param {object} selectedDevices – selected devices
   * @returns {void}
   */
  setSelectedDevices({ commit, state, getters }, selectedDevices) {
    commit('SET_SELECTED_DEVICES', selectedDevices);

    heykaStore.set('selectedSpeaker', selectedDevices.speaker);
    heykaStore.set('selectedMicrophone', selectedDevices.microphone);
    heykaStore.set('selectedCamera', selectedDevices.camera);

    const selectedSpeaker = getters['getDevice']('speakers', selectedDevices.speaker);
    const selectedMicrophone = getters['getDevice']('microphones', selectedDevices.microphone);
    const selectedCamera = getters['getDevice']('cameras', selectedDevices.camera);

    heykaStore.set('selectedSpeakerLabel', selectedSpeaker?.rawLabel || '');
    heykaStore.set('selectedMicrophoneLabel', selectedMicrophone?.rawLabel || '');
    heykaStore.set('selectedCameraLabel', selectedCamera?.rawLabel || '');

    sounds.setSinkId(state.realSelectedDevices.speaker);
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
