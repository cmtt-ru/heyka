import API from '@api';
import { mapKeys } from '@libs/arrays';
import * as sockets from '@api/socket';
import callWindow from '@classes/callWindow';
import { ipcRenderer } from 'electron';
import router from '@/router';
import sounds from '@classes/sounds';
import connectionCheck from '@classes/connectionCheck';

export default {

  /**
   * Initialize store and app state
   * @param {object} context – store context
   * @returns {void}
   */
  async initial({ commit, dispatch, getters }) {
    /** Wait until internet goes online */
    await connectionCheck.waitUntilOnline();

    /** Get authenticated user */
    const authenticatedUser = await API.user.getAuthenticatedUser();

    /** Authenticated user id */
    const userId = authenticatedUser.id;

    if (userId) {
      dispatch('me/update', authenticatedUser);

      /** Get workspaces list */
      /**
       * todo: Предусмотреть, что воркспейсов может не быть.
       *       Перекинуть юзера на веб страницу где можно создать воркспейс
       */
      const workspaces = await API.workspace.getWorkspaces();
      const workspacesIdList = workspaces.map(w => w.id);

      /** Selected workspace id */
      let selectedWorkspaceId = getters['me/getSelectedWorkspaceId'];

      if (!selectedWorkspaceId || !workspacesIdList.includes(selectedWorkspaceId)) {
        selectedWorkspaceId = workspaces[0].id;
        dispatch('me/setSelectedWorkspaceId', selectedWorkspaceId);
      }

      commit('me/SET_USER_ID', userId);
      commit('workspaces/SET_COLLECTION', mapKeys(workspaces, 'id'));

      /** Get specific workspace data */
      await dispatch('updateCurrentWorkspaceState');

      await sockets.init();

      dispatch('me/setOnlineStatus', 'online');
    } else {
      console.error('AUTH REQUIRED');
    }
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
  selectChannelWithoutAPICall({ commit, getters, state }, { id, connectionOptions }) {
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
      callWindow.closeGrid();
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

    commit('me/SET_CHANNEL_ID', id);

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
  async unselectChannel({ commit, dispatch }, id) {
    commit('app/ANIMATION_CHANNEL_ID', null);
    try {
      await API.channel.unselect(id);
    } catch (err) {
      if (err.message !== 'unselect throttled') {
        commit('app/ANIMATION_CHANNEL_ID', id);
      }
    }

    dispatch('unselectChannelWithoutAPICall', id);
  },

  /**
   * Unselect (join) channel without api call
   * @param {object} context – store context
   * @param {string} id – channel id
   * @returns {object} unselected channel
   */
  unselectChannelWithoutAPICall({ commit, dispatch, state }, id) {
    commit('channels/REMOVE_USER', {
      userId: state.me.id,
      channelId: id,
    });

    commit('me/SET_CHANNEL_ID', null);

    dispatch('me/setDefaultMediaState');

    callWindow.hideAll();

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
      commit('SET_SOCKET_CONNECTED', false);
    } else {
      // Handle socket connected
      commit('SET_SOCKET_CONNECTED', true);

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
};
