import API from '@api';
import { mapKeys } from '@libs/arrays';
import * as sockets from '@api/socket';
import initialProcess from '@api/initialProcess';
import callWindow from '@classes/callWindow';
import { ipcRenderer } from 'electron';
import router from '@/router';
import sounds from '@sdk/classes/sounds';
import connectionCheck from '@sdk/classes/connectionCheck';
import Logger from '@sdk/classes/logger';

const cnsl = new Logger('Initial', '#db580e');

export default {

  /**
   * Initialize store and app state
   * @param {object} context – store context
   * @returns {void}
   */
  async initial({ commit, dispatch, getters }) {
    if (initialProcess.getState()) {
      return;
    } else {
      initialProcess.setState(true);
    }

    cnsl.log('start');

    try {
      /** Wait until internet goes online */
      await connectionCheck.waitUntilOnline();

      /** Get authenticated user */
      const authenticatedUser = await API.user.getAuthenticatedUser();

      /** Authenticated user id */
      const userId = authenticatedUser.id;

      if (userId) {
        commit('me/SET_USER_ID', userId);
        dispatch('me/update', authenticatedUser);

        /** Update workspace list */
        await dispatch('workspaces/updateList');

        /** Get specific workspace data */
        await dispatch('updateCurrentWorkspaceState');

        await sockets.init();

        dispatch('me/setOnlineStatus', 'online');
      } else {
        console.error('AUTH REQUIRED');
      }
    } catch (err) {
      cnsl.log('error', err);
    }

    initialProcess.setState(false);

    cnsl.log('finish');
  },

  /**
   * Update full state of current workspace
   * @param {function} commit Commit to state
   * @param {object} getters Store getters
   * @returns {Promise<void>}
   */
  async updateCurrentWorkspaceState({ commit, getters }) {
    const workspaceId = getters['me/getSelectedWorkspaceId'];

    if (!workspaceId) {
      console.error('No workspace is selected');

      return;
    }

    const workspace = await API.workspace.getWorkspaceByID(workspaceId);

    commit('channels/SET_COLLECTION', mapKeys(workspace.channels, 'id'));
    commit('users/SET_COLLECTION', mapKeys(workspace.users, 'id'));
  },

  /**
   * Select (join) channel
   * @param {object} context – store context
   * @param {string} id – channel id
   * @param {object?} janusOptions object
   * @returns {object} selected channel
   */
  async selectChannel({ commit, dispatch, getters }, id) {
    if (id === getters['me/getSelectedChannelId']) {
      return;
    }
    commit('app/ANIMATION_CHANNEL_ID', id);

    let response;

    commit('me/SET_MEDIA_STATE', {
      ...getters['me/getMediaState'],
      camera: false,
      screen: false,
    });

    dispatch('janus/setSharingSource', null, { root: true });

    try {
      response = await API.channel.select(id, getters['me/getMediaState']);
      dispatch('selectChannelWithoutAPICall', {
        id,
        connectionOptions: response.connectionOptions,
      });
    } catch (err) {
      if (err.message !== 'select throttled') {
        commit('app/ANIMATION_CHANNEL_ID', null);
      }
    }

    sounds.play('me-joined');
  },

  /**
   * Select (join) channel without API call
   * @param {object} context – store context
   * @param {string} id – channel id
   * @param {object} connectionOptions Connection options object
   * @returns {object} selected channel
   */
  selectChannelWithoutAPICall({ commit, dispatch, getters, state }, { id, connectionOptions }) {
    if (id === getters['me/getSelectedChannelId']) {
      return;
    }

    commit('me/SET_MEDIA_STATE', {
      ...getters['me/getMediaState'],
      camera: false,
      screen: false,
    });

    if (state.me.selectedChannelId !== null && state.me.selectedChannelId !== '') {
      commit('channels/REMOVE_USER', {
        userId: state.me.id,
        channelId: state.me.selectedChannelId,
      });
    }

    commit('janus/SET_OPTIONS', connectionOptions);

    commit('channels/ADD_USER', {
      userId: state.me.id,
      channelId: id,
      userMediaState: {
        ...getters['me/getMediaState'],
        camera: false,
        screen: false,
      },
    });

    dispatch('me/setChannelId', id);

    callWindow.showOverlay();

    if (state.me.mediaState.microphone === true) {
      ipcRenderer.send('tray-animation', true);
    }
  },

  /**
   * Unselect (join) channel
   * @param {object} context – store context
   * @param {string} id – channel id
   * @returns {object} unselected channel
   */
  async unselectChannel({ commit, dispatch, state }, id = state.me.selectedChannelId) {
    commit('app/ANIMATION_CHANNEL_ID', null);
    try {
      await API.channel.unselect(id);
    } catch (err) {
      if (err.message !== 'unselect throttled') {
        commit('app/ANIMATION_CHANNEL_ID', id);
      }
    }

    await dispatch('app/removePushByName', 'noSound');

    dispatch('unselectChannelWithoutAPICall', id);
  },

  /**
   * Unselect (join) channel without api call
   * @param {object} context – store context
   * @param {string} id – channel id
   * @returns {object} unselected channel
   */
  unselectChannelWithoutAPICall({ commit, dispatch, state }, id = state.me.selectedChannelId) {
    commit('channels/REMOVE_USER', {
      userId: state.me.id,
      channelId: id,
    });

    dispatch('me/setChannelId', null);

    dispatch('me/setDefaultMediaState');

    callWindow.closeAll();

    ipcRenderer.send('tray-animation', false);
  },

  /**
   * Open Grid (main call window)
   * @param {object} context – store context
   * @param {number} userId - if found, open expanded view with this user
   * @returns {void}
   */
  async openGrid({ state }, userId) {
    callWindow.hideOverlay();
    callWindow.showGrid(userId);
  },

  /**
   * Set socket connected
   * @param {object} context store context
   * @param {object} authData is socket connected
   * @param {boolean} authData.connected Is socket connected
   * @param {boolean?} authData.reconnected Is socket has been reconnected
   * @param {number?} authData.audioRoomId Audio room id
   * @param {number?} authData.videoRoomId Video room id
   * @param {string?} authData.channelAuthToken Channel auth token
   * @param {string?} authData.serverAuthToken server auth token
   * @param {string?} authData.url Janus server url
   * @param {string?} authData.channelId Channel id
   * @returns {void}
   */
  async setSocketConnected({ state, commit, getters, dispatch }, authData) {
    // Set socket disconnected
    if (!authData || !authData.connected) {
      // commit('SET_SOCKET_CONNECTED', false);
    } else {
      // Handle socket connected
      // commit('SET_SOCKET_CONNECTED', true);

      if (authData.reconnected) {
        // if server said that channel is selected
        // then select channel in app
        if (authData.channelId && getters['me/getSelectedChannelId'] !== authData.channelId) {
          dispatch('selectChannelWithoutAPICall', {
            id: authData.channelId,
            connectionOptions: authData,
          });
        }

        // if server said that channel not selected
        // unselect channel in app
        if (!authData.channelId && getters['me/getSelectedChannelId']) {
          dispatch('unselectChannelWithoutAPICall', getters['me/getSelectedChannelId']);
        }
      }

      if (!authData.reconnected && getters['me/getSelectedChannelId']) {
        dispatch('unselectChannelWithoutAPICall', getters['me/getSelectedChannelId']);
      }

      // update full workspace state
      await dispatch('updateCurrentWorkspaceState');
    }
  },

  /**
   * Open sharing window
   * @returns {void}
   */
  async openSharingWindow() {
    callWindow.showSharing();
  },

  /**
   * Close sharing window
   * @returns {void}
   */
  async closeSharingWindow() {
    callWindow.closeSharing();
  },

  /**
   * Create private channel
   *
   * @param {object} vuex functions
   * @param {string} userId – user id
   * @returns {void}
   */
  async createPrivateChannel({ state, commit, getters, dispatch }, userId) {
    const selectedWorkspaceId = getters['me/getSelectedWorkspaceId'];

    const response = await API.workspace.privateTalk(selectedWorkspaceId, {
      users: [ userId ],
    });

    if (response.channel) {
      commit('channels/ADD_CHANNEL', response.channel);
      await dispatch('selectChannel', response.channel.id);

      router.push({
        name: 'channel',
        params: {
          id: response.channel.id,
        },
      });
    }
  },

  /**
   * Log in using auth link
   *
   * @param {object} vuex context
   * @param {string} authLink – code to log in with
   * @returns {void}
   */
  async useAuthLink({ dispatch }, authLink) {
    try {
      await API.auth.signinByLink(authLink);

      await dispatch('initial');

      await router.replace({
        name: 'workspace',
      });
    } catch (err) {
      console.log(`Code ${authLink} is invalid:`, err);
    }
  },

  /**
   * Change current workspace
   *
   * @param {object} vuex context
   * @param {string} workspaceId – workspace id
   * @returns {Promise<void>}
   */
  async changeWorkspace({ dispatch, getters }, workspaceId) {
    const selectedChannelId = getters['me/getSelectedChannelId'];

    if (selectedChannelId) {
      await dispatch('unselectChannel', selectedChannelId);
    }

    await dispatch('me/setSelectedWorkspaceId', workspaceId);

    sockets.destroy();

    await dispatch('initial');
  },
};
