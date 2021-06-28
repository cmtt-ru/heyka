import API from '@api';
import themes from '@sdk/themes';
import i18n from '@sdk/translations/i18n';
import dateFormat from 'dateformat';
import { v4 as uuidV4 } from 'uuid';
import { heykaStore } from '@/store/localStore';
import sounds from '@sdk/classes/sounds';
import { conversationBroadcast } from '@api/socket/utils';
import intercom from '@classes/intercom';
import { GA_EVENTS, trackEvent } from '@libs/analytics';

/**
 * @typedef PrivacyLogData
 * @property {string} category – category, e.g. API or SOCKET
 * @property {string} method – method name, e.g. getWorkspaces
 * @property {object} data – data sent, e.g. {userId: '...'}
 */

let selectedDevicesLoaded = false;

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
    window.ipcRenderer.send('app-toggle-autolaunch', autorun);
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
   * Set muteHotkey mode
   *
   * @param {function} commit – store commit
   * @param {string} muteHotkey – app muteHotkey mode
   * @returns {void}
   */
  setMuteHotkey({ commit }, muteHotkey) {
    commit('SET_MUTE_HOTKEY', muteHotkey);
    heykaStore.set('muteHotkey', muteHotkey);
    if (muteHotkey) {
      window.ipcRenderer.send('remote-register-mute-shortcut');
    } else {
      window.ipcRenderer.send('remote-unregister-mute-shortcut');
    }
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
   * @param {function} rootGetters – store rootGetters
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

    trackEvent(GA_EVENTS.pushInviteSend);

    return inviteId;
  },

  /**
   * Send multipe pushes
   *
   * @param {function} rootGetters – store rootGetters
   * @param {object} notif – push
   *  @param {array} notif.users - array of user ids'
   * @returns {string} id
   */
  async sendMultiplePushes({ rootGetters }, { users, isResponseNeeded = false, message }) {
    const workspaceId = rootGetters['me/getSelectedWorkspaceId'];

    const { inviteId } = await API.user.sendInvites({
      users,
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
  async addPush({ commit, rootGetters }, { inviteId, userId, workspaceId, message, name, data }) {
    const push = {
      inviteId,
      userId,
      workspaceId,
      name,
      ...message,
    };

    if (userId) {
      push.user = rootGetters['users/getUserById'](userId) || await API.app.getUser(userId);
    }
    if (workspaceId) {
      push.workspace = rootGetters['workspaces/getWorkspaceById'](workspaceId);
    }
    if (message.channelId) {
      push.channel = rootGetters['channels/getChannelById'](message.channelId) || await API.channel.info(message.channelId);
    }

    if (data) {
      push.data = data;
    }

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
   * Remove pushes by name
   *
   * @param {function} commit – store commit
   * @param {string} name – push's name
   * @returns {void}
  */
  removePushByName({ commit, state }, name) {
    for (const push of state.pushes) {
      if (push.name === name) {
        commit('REMOVE_PUSH', push.inviteId);
      }
    }
  },

  /**
   * Send slack invite to offline User
   *
   * @param {function} rootGetters – store rootGetters
   * @param {object} userId – recipent's user id
   * @returns {string} id
   */
  async sendSlackInviteToChannel({ rootGetters }, userId) {
    // if (rootGetters['me/getMyId'] === userId) {
    //   return;
    // }

    const workspaceId = rootGetters['me/getSelectedWorkspaceId'];
    const channelId = rootGetters['me/getSelectedChannelId'];

    const { inviteId } = await API.user.sendSlackInvite({
      userId,
      workspaceId,
      channelId,
    });

    return inviteId;
  },

  /**
   * Set selected devices
   *
   * @param {object} vuex context
   * @param {object} devices – selected devices
   * @returns {void}
   */
  setSelectedDevices({ state, commit, getters }, devices) {
    const selectedDevices = devices ? { ...devices } : { ...state.selectedDevices };

    /** Re-set default devices if previous id's are not found */
    if (!state.devices.speakers.map(el => el.id).includes(selectedDevices.speaker)) {
      selectedDevices.speaker = 'default';
    }
    if (!state.devices.microphones.map(el => el.id).includes(selectedDevices.microphone)) {
      selectedDevices.microphone = 'default';
    }
    if (!state.devices.cameras.map(el => el.id).includes(selectedDevices.camera)) {
      if (state.devices.cameras[0]) {
        selectedDevices.camera = state.devices.cameras[0].id;
      } else {
        selectedDevices.camera = '';
      }
    }

    commit('SET_SELECTED_DEVICES', selectedDevices);

    /** Save selected devices to storage */
    Object.keys(selectedDevices).forEach(deviceType => {
      const deviceTypeCapitalized = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

      heykaStore.set(`selected${deviceTypeCapitalized}`, selectedDevices[deviceType]);

      const device = getters.getDevice(deviceType, selectedDevices[deviceType]);

      heykaStore.set(`selected${deviceTypeCapitalized}Label`, device?.rawLabel || '');
    });

    /** Set output device for app sounds */
    sounds.setSinkId(state.realSelectedDevices.speaker);
  },

  /**
   * Load selected devices from storage
   *
   * @param {object} vuex context
   * @returns {void}
   */
  loadSelectedDevices({ getters, dispatch }) {
    const selectedDevices = {
      speaker: getters.loadSelectedDevice('speaker'),
      microphone: getters.loadSelectedDevice('microphone'),
      camera: getters.loadSelectedDevice('camera'),
    };

    dispatch('setSelectedDevices', selectedDevices);
  },

  /**
   * Set device list
   *
   * @param {object} vuex context
   * @param {object} devices – device list
   * @returns {void}
   */
  setDevices({ commit, dispatch }, devices) {
    commit('SET_DEVICES', devices);

    if (!selectedDevicesLoaded) {
      dispatch('loadSelectedDevices');
      selectedDevicesLoaded = true;
    } else {
      dispatch('setSelectedDevices');
    }
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

  handUpInChannel({ rootGetters }, state) {
    conversationBroadcast('hand-up', rootGetters['me/getMyId'], { state });

    if (state) {
      trackEvent(GA_EVENTS.raiseHand);
    }
  },

  sendMiniChatMessage({ rootGetters }, message) {
    conversationBroadcast('mini-chat', rootGetters['me/getMyId'], {
      message,
    });
  },

  markMiniChatAsRead({ commit }) {
    commit('SET_MINI_CHAT_READ_TIMESTAMP', Date.now());
  },

  openIntercom({ rootGetters }) {
    const user = rootGetters['users/getUserById'](rootGetters['me/getMyId']);

    intercom.init();
    intercom.show();
    intercom.setUserData({
      name: user.name,
      email: user.email,
    });
  },
};
