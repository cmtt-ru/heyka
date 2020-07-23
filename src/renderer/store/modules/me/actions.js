import API from '@api';
import callWindow from '@classes/callWindow';
import * as sockets from '@api/socket';
import { ipcRenderer } from 'electron';
import { meStore } from '@/store/localStore';
import Logger from '@classes/logger';
import sounds from '@classes/sounds';
const cnsl = new Logger('Vuex actions /me', '#17A589');

export default {
  /**
   * Set selected workspace id
   *
   * @param {function} commit – store commit
   * @param {string} id – workspace id
   * @returns {void}
   */
  setSelectedWorkspaceId({ commit }, id) {
    commit('SET_WORKSPACE_ID', id);
    meStore.set('selectedWorkspaceId', id);
  },

  /**
   * Set our new media state
   *
   * @param {function} commit – store commit
   * @param {MediaState} mediaState – new mediaState
   * @param {function} getters – store getters
   * @param {MeState} state – state
   * @param {function} dispatch – dispatch action
   * @returns {void}
   */
  async setMediaState({ commit, getters, state, dispatch }, mediaState) {
    const selectedChannelId = getters['getSelectedChannelId'];

    /**
     * User is trying to share camera and screen at the same time
     */
    if (mediaState.camera === true && mediaState.screen === true) {
      /** If user is already sharing camera, than disable it */
      if (state.mediaState.camera === true) {
        mediaState.camera = false;
      }

      /** If user is already sharing screen, than disable it */
      if (state.mediaState.screen === true) {
        dispatch('janus/setSharingSource', null, { root: true });
        mediaState.screen = false;
      }

      const newState = {
        ...state.mediaState,
        camera: false,
        screen: false,
      };

      /** Set media state of camera & screen to false */
      commit('SET_MEDIA_STATE', newState);

      if (selectedChannelId) {
        await API.user.setMediaState(newState);
      }

      await dispatch('janus/untilIdle', null, { root: true });
    } else if (mediaState.screen === false && state.mediaState.screen === true) {
      dispatch('janus/setSharingSource', null, { root: true });
    }

    /**
     * Speaker on / off & Microphone mute / unmute logic
     */
    if (state.mediaState.speakers !== mediaState.speakers) {
      /** If user going to off speakers than mute microphone */
      if (mediaState.speakers === false) {
        mediaState.microphone = false;
        commit('SET_PREVIOUS_STATE', state.mediaState);
      }

      /** If user going to on speakers than set microphone to previous state*/
      if (mediaState.speakers === true) {
        mediaState.microphone = state.previousMediaState.microphone;
      }
    }

    /**
     * If microphone goes unmute, than on speakers
     */
    if (mediaState.microphone && !state.mediaState.speakers) {
      mediaState.speakers = true;
    }

    if (state.mediaState.microphone !== mediaState.microphone) {
      sounds.play('microphone-toggle');
    }

    commit('SET_MEDIA_STATE', mediaState);

    if (selectedChannelId) {
      await API.user.setMediaState(mediaState);

      if (mediaState.microphone === true) {
        ipcRenderer.send('tray-animation', true);
      } else {
        ipcRenderer.send('tray-animation', false);
      }
    }
  },

  /**
   * Set default media state
   *
   * @param {function} commit – store commit
   * @param {MeState} state – state
   * @returns {void}
   */
  async setDefaultMediaState({ commit, state }) {
    const defaultState = {
      ...state.mediaState,
      microphone: false,
      camera: false,
      screen: false,
      speakers: true,
      speaking: false,
    };

    commit('SET_MEDIA_STATE', defaultState);
  },

  /**
   * Stop all media sharing
   *
   * @param {function} commit – store commit
   * @param {MeState} state – state
   * @param {function} dispatch – dispatch action
   * @returns {void}
   */
  async stopMediaSharing({ commit, state, dispatch }) {
    dispatch('janus/setSharingSource', null, { root: true });

    dispatch('setMediaState', {
      ...state.mediaState,
      camera: false,
      screen: false,
    });
  },

  /**
   * Set media sharing mode
   *
   * @param {function} commit – store commit
   * @param {boolean} state – state
   * @returns {void}
   */
  async setMediaSharingMode({ commit }, state) {
    callWindow.setMediaSharingMode(state);
  },

  /**
   * Set user online status
   *
   * @param {function} commit – vuex commit
   * @param {string} status — online status
   * @returns {Promise<void>}
   */
  async setOnlineStatus({ commit }, status) {
    commit('SET_ONLINE_STATUS', status);
    meStore.set('onlineStatus', status);
    await API.user.setOnlineStatus(status);
  },

  /**
   * Set suspend state
   * @param {object} context – store context
   * @param {boolean} value – state
   * @returns {void}
   */
  async setSuspendState({ commit, dispatch, getters, state }, value) {
    if (value) {
      cnsl.log('Sleep');
    } else {
      cnsl.log('Awake');
    }

    /** Sleep */
    if (value) {
      /** Leave channel */
      const selectedChannelId = getters['getSelectedChannelId'];

      if (selectedChannelId) {
        await dispatch('unselectChannel', selectedChannelId, { root: true });
      }
      sockets.destroy();
    }

    /** Wake up */
    if (!value) {
      await dispatch('initial', null, { root: true });
    }

    commit('SET_SUSPEND_STATE', value);

    if (!value && state.lockScreenState) {
      await dispatch('setLockScreenState', false);
    }
  },

  /**
   * Set lock screen state
   * @param {object} context – store context
   * @param {boolean} value – state
   * @param {MeState} state – store context
   * @returns {void}
   */
  async setLockScreenState({ state, commit, dispatch, getters }, value) {
    const statusByState = value ? 'idle' : 'online';

    /**  If already suspended than ignore lock screen */
    if (state.suspendState === true || state.lockScreenState === value) {
      return;
    }

    if (value) {
      cnsl.log('Lock');
    } else {
      cnsl.log('Unlock');
    }

    /** Screen locked */
    if (value) {
      /** Stop all media sharing */
      await dispatch('stopMediaSharing');

      if (state.onlineStatus === 'online') {
        await dispatch('setOnlineStatus', statusByState);
      } else {
        await dispatch('setOnlineStatus', state.onlineStatus);
      }
    }

    /** Screen unlocked */
    if (!value && state.previousOnlineStatus === 'online') {
      await dispatch('setOnlineStatus', statusByState);
    }

    commit('SET_LOCK_SCREEN_STATE', value);
  },

  /**
   * Change microphone state
   * @param {MeState} state – vuex state
   * @param {boolean} micState – microphone state
   * @param {function} dispatch – vuex dispatch
   * @returns {void}
   */
  microphoneState({ state, dispatch }, micState) {
    const newState = { ...state.mediaState };

    newState.microphone = micState;
    dispatch('setMediaState', newState);
  },
};
