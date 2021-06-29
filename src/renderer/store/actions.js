import API from '@api';
import { mapKeys } from '@libs/arrays';
import * as sockets from '@api/socket';
import initialProcess from '@api/initialProcess';
import callWindow from '@classes/callWindow';
import router from '@/router';
import sounds from '@sdk/classes/sounds';
import connectionCheck from '@sdk/classes/connectionCheck';
import Logger from '@sdk/classes/logger';
import { GA_EVENTS, trackEvent } from '@libs/analytics';

const cnsl = new Logger('Initial', '#db580e');
const PLAY_SOUND_TIMEOUT = 10;

export default {

  /**
   * Initialize store and app state
   * @param {object} context – store context
   * @returns {void}
   */
  async initial({ commit, dispatch, getters }) {
    if (initialProcess.getState()) {
      cnsl.log('ignore... initial in progress');

      return;
    } else {
      initialProcess.setState(true);
    }

    cnsl.log('start');
    connectionCheck.resetConnectionStatus();

    try {
      /** Wait until internet goes online */
      await connectionCheck.waitUntilOnline();

      /** Get authenticated user */
      cnsl.log('...wait for authenticated user');
      const authenticatedUser = await API.user.getAuthenticatedUser();

      /** Authenticated user id */
      const userId = authenticatedUser.id;

      if (userId) {
        commit('me/SET_USER_ID', userId);
        commit('me/SET_USER_EMAIL', authenticatedUser.email);
        dispatch('me/updateSocial', authenticatedUser);

        /** Update workspace list */
        cnsl.log('...wait for workspace list');
        const updateListState = await dispatch('workspaces/updateList');

        if (updateListState) {
          /** Get specific workspace data */
          cnsl.log('...wait for current workspace');
          await dispatch('updateCurrentWorkspaceState');

          cnsl.log('...wait for sockets init');
          await sockets.init();

          connectionCheck.appStatusVisibleState(true);

          const routes = [
            'auth',
            'auth',
            'auth-email-signin',
            'auth-email-reset',
            'no-workspace',
          ];

          if (routes.indexOf(router.history.current.name) >= 0) {
            await router.replace({ name: 'workspace' });
          }
        } else {
          cnsl.log('...workspace list is empty');
          connectionCheck.appStatusVisibleState(false);

          await router.replace({ name: 'no-workspace' });
        }
      } else {
        console.error('AUTH REQUIRED');
      }
    } catch (err) {
      cnsl.log('error', err);
    } finally {
      initialProcess.setState(false);
      cnsl.log('finish');
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
    const settings = await API.workspace.getWorkspaceSettings(workspaceId);

    commit('workspaces/SET_SETTINGS', {
      id: workspaceId,
      settings: settings,
    });

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

    setTimeout(() => {
      sounds.play('me-joined');
    }, PLAY_SOUND_TIMEOUT);
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

      commit('channels/CLEAR_CONVERSATION_DATA', { channelId: id });
      commit('channels/CLEAR_CONVERSATION_EVENTS', { channelId: id });
    }

    commit('janus/SET_OPTIONS', connectionOptions);

    if (state.app.muteHotkey) {
      window.ipcRenderer.send('remote-register-mute-shortcut');
    }

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

    // const isAnybodySharingMedia = getters['isAnybodySharingMedia'];
    // const isMediaSharing = isAnybodySharingMedia && !state.me.mediaState.screen;

    callWindow.showOverlay();

    if (state.me.mediaState.microphone === true) {
      window.ipcRenderer.send('tray-animation', true);
    }
  },

  /**
   * Unselect (join) channel
   * @param {object} context – store context
   * @param {string} id – channel id
   * @returns {object} unselected channel
   */
  async unselectChannel({ commit, dispatch, state, getters }, id = state.me.selectedChannelId) {
    commit('app/ANIMATION_CHANNEL_ID', null);

    const channel = getters['channels/getChannelById'](id);

    if (channel && channel.isTemporary) {
      router.replace({ name: 'workspace' });
    }

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
  unselectChannelWithoutAPICall({ commit, dispatch, state, getters }, id = state.me.selectedChannelId) {
    const channel = getters['channels/getChannelById'](id);

    if (channel) {
      commit('channels/REMOVE_USER', {
        userId: state.me.id,
        channelId: id,
      });

      commit('channels/CLEAR_CONVERSATION_DATA', { channelId: id });
      commit('channels/CLEAR_CONVERSATION_EVENTS', { channelId: id });
    }

    window.ipcRenderer.send('remote-unregister-mute-shortcut');

    dispatch('me/setChannelId', null);

    dispatch('me/setDefaultMediaState');

    callWindow.closeAll();

    window.ipcRenderer.send('tray-animation', false);

    if (router.history.current.name === 'channel-invite') {
      router.replace({ name: 'workspace' });
    }
  },

  /**
   * Open Grid (main call window)
   * @param {object} context – store context
   * @param {number} userId - if found, open expanded view with this user
   * @returns {void}
   */
  async openGrid({ state }, userId) {
    await callWindow.showGrid(userId);
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
    if (authData && authData.connected) {
      if (!authData.reconnected) {
        const selectedChannelId = getters['me/getSelectedChannelId'];

        if (selectedChannelId) {
          dispatch('unselectChannelWithoutAPICall', selectedChannelId);
        }
      }

      if (authData.reconnected) {
        // const selectedChannelId = getters['me/getSelectedChannelId'];
        //
        // dispatch('selectChannelWithoutAPICall', {
        //   id: authData.channelId,
        //   connectionOptions: authData,
        // });
      }

      connectionCheck.handleSocketState(true);

      await dispatch('updateCurrentWorkspaceState');
    } else {
      connectionCheck.handleSocketState(false);
    }
  },

  /**
   * Open sharing window
   * @returns {void}
   */
  async openSharingWindow() {
    return callWindow.showSharing();
  },

  /**
   * Close sharing window
   * @returns {void}
   */
  async closeSharingWindow() {
    await callWindow.closeSharing();
  },

  /**
   * Create private channel
   *
   * @param {object} vuex functions
   * @param {string} userId – user id
   * @param {boolean} redirect – false if no need to redirect to channel
   * @returns {void}
   */
  async createPrivateChannel({ state, commit, getters, dispatch }, { userId, redirect = true }) {
    const selectedWorkspaceId = getters['me/getSelectedWorkspaceId'];

    const response = await API.workspace.privateTalk(selectedWorkspaceId, {
      users: [ userId ],
    });

    if (response.channel) {
      commit('channels/ADD_CHANNEL', response.channel);
      await dispatch('selectChannel', response.channel.id);

      if (redirect) {
        router.push({
          name: 'channel',
          params: {
            id: response.channel.id,
          },
        });
      }

      return response.channel.id;
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
    if (workspaceId === getters['me/getSelectedWorkspaceId']) {
      return;
    }

    const selectedChannelId = getters['me/getSelectedChannelId'];

    if (selectedChannelId) {
      await dispatch('unselectChannel', selectedChannelId);
    }

    await dispatch('me/setSelectedWorkspaceId', workspaceId);

    sockets.destroy();

    router.replace({ name: 'workspace' });

    trackEvent(GA_EVENTS.workspaceChange);

    await dispatch('initial');
  },

  async selectAnyWorkspace({ dispatch, getters }) {
    await dispatch('workspaces/updateList', false);
    const firstWorkspace = getters['workspaces/getWorkspaces'][0];

    if (!firstWorkspace) {
      await router.replace({ name: 'no-workspace' });
    } else {
      await dispatch('changeWorkspace', firstWorkspace.id);
    }
  },

  /**
   * Change current workspace ans connect to channel
   *
   * @param {object} vuex context
   * @param {string} workspaceId – workspace id
   * @returns {Promise<void>}
   */
  async selectChannelInAnotherWorkspace({ dispatch }, { workspaceId, channelId }) {
    await dispatch('changeWorkspace', workspaceId);
    await dispatch('selectChannel', channelId);
    trackEvent(GA_EVENTS.pushInviteAccept);
  },

  /**
   * Clear some stuff in vuex after logout
   *
   * @param {object} vuex context
   *
   * @returns {Promise<void>}
   */
  logout({ commit }) {
    commit('me/SET_USER_ID', null);
  },

};
