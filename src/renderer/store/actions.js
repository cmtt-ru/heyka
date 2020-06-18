import API from '@api';
import { mapKeys } from '@libs/arrays';
import * as sockets from '@api/socket';
import callWindow from '@classes/callWindow';
import { ipcRenderer } from 'electron';

export default {

  /**
   * Initialize store and app state
   * @param {object} context – store context
   * @returns {void}
   */
  async initial({ commit, dispatch, getters }) {
    /** Get authenticated user */
    const authenticatedUser = await API.user.getAuthenticatedUser();

    /** Authenticated user id */
    const userId = authenticatedUser.id;

    if (userId) {
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
   * @returns {object} selected channel
   */
  async selectChannel({ commit, getters, state }, id) {
    if (id === getters['me/getSelectedChannelId']) {
      return;
    }
    commit('me/SET_MEDIA_STATE', {
      ...getters['me/getMediaState'],
      camera: false,
      screen: false,
    });
    const response = await API.channel.select(id, getters['me/getMediaState']);

    if (state.me.selectedChannelId !== null && state.me.selectedChannelId !== '') {
      commit('channels/REMOVE_USER', {
        userId: state.me.id,
        channelId: state.me.selectedChannelId,
      });
    }

    commit('janus/SET_OPTIONS', response.connectionOptions);

    commit('channels/ADD_USER', {
      userId: state.me.id,
      channelId: id,
      userMediaState: getters['me/getMediaState'],
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
  async unselectChannel({ commit, dispatch, state }, id) {
    await API.channel.unselect(id);

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
   * @returns {void}
   */
  async openGrid() {
    callWindow.hideOverlay();
    callWindow.showGrid();
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
          commit('janus/SET_OPTIONS', authData);

          commit('channels/ADD_USER', {
            userId: state.me.id,
            channelId: authData.channelId,
            userMediaState: getters['me/getMediaState'],
          });

          commit('me/SET_CHANNEL_ID', authData.channelId);

          callWindow.showOverlay();

          if (state.me.mediaState.microphone === true) {
            ipcRenderer.send('tray-animation', true);
          }
        }

        // if server said that channel not selected
        // unselect channel in app
        if (!authData.channelId && getters['me/getSelectedChannelId']) {
          commit('channels/REMOVE_USER', {
            userId: state.me.id,
            channelId: authData.channelId,
          });

          commit('me/SET_CHANNEL_ID', null);

          dispatch('me/setDefaultMediaState');

          callWindow.hideAll();

          ipcRenderer.send('tray-animation', false);
        }
      }

      if (!authData.reconnected && getters['me/getSelectedChannelId']) {
        commit('channels/REMOVE_USER', {
          userId: state.me.id,
          channelId: getters['me/getSelectedChannelId'],
        });

        commit('me/SET_CHANNEL_ID', null);

        dispatch('me/setDefaultMediaState');

        callWindow.hideAll();

        ipcRenderer.send('tray-animation', false);
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
};
