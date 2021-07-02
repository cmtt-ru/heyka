import API from '@api';
import callWindow from '@classes/callWindow';
import * as sockets from '@api/socket';
import { meStore } from '@/store/localStore';
import Logger from '@sdk/classes/logger';
import sounds from '@sdk/classes/sounds';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import network from '@sdk/classes/network';
import faceDetection from '@classes/faceDetection';

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
      meStore.set('microphone', mediaState.microphone);
    }

    if (mediaState.microphone) {
      await dispatch('app/removePushByName', 'noSound', { root: true });
    }

    commit('SET_MEDIA_STATE', mediaState);

    if (selectedChannelId) {
      // commit('channels/SET_USER_MEDIA_STATE', {
      //   userId: state.id,
      //   channelId: selectedChannelId,
      //   userMediaState: mediaState,
      // }, { root: true });
      await API.user.setMediaState(mediaState);

      if (mediaState.microphone === true) {
        window.ipcRenderer.send('tray-animation', true);
      } else {
        window.ipcRenderer.send('tray-animation', false);
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
  async setDefaultMediaState({ commit, state, rootState }) {
    const defaultState = {
      ...state.mediaState,
      camera: false,
      screen: false,
      speakers: true,
      speaking: false,
    };

    if (rootState.app.muteMic) {
      defaultState.microphone = false;
      meStore.set('microphone', false);
    }

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
   * Set online when computer goes sleep
   *
   * @param {function} commit – vuex commit
   * @param {boolean} state – sleep state
   * @returns {Promise<void>}
   */
  async setOnlineStatusSleep({ commit }, state) {
    const status = state ? 'idle' : 'online';

    commit('SET_ONLINE_STATUS', status);
    meStore.set('onlineStatus', status);
    await API.user.setOnlineStatus(status, 'sleep');
  },

  /**
   * Set suspend state
   * @param {object} context – store context
   * @param {boolean} value – state
   * @returns {void}
   */
  async setSuspendState({ commit, dispatch, getters, state, rootGetters }, value) {
    if (value) {
      cnsl.log('Sleep');
      network.stopWatch();
    } else {
      cnsl.log('Awake');
      network.watchInternetState();
    }

    commit('SET_SUSPEND_STATE', value);

    /** Sleep */
    if (value) {
      /** Leave channel */
      const selectedChannelId = getters['getSelectedChannelId'];

      if (selectedChannelId) {
        try {
          await dispatch('unselectChannel', selectedChannelId, { root: true });
        } catch (e) {
          console.error(`Can't unselect channel while in sleep`, e);
        }
      }

      await sockets.destroy();
    }

    /** Wake up */
    if (!value) {
      /**
       * ٩(ఠ益ఠ)۶
       * Dirty workaround with hanging connection status
       * @since 21.06.2021
       */
      setTimeout(() => {
        if (!rootGetters['app/getConnectionStatus']) {
          location.reload();
        }
        // eslint-disable-next-line no-magic-numbers
      }, 5000);

      commit('app/ANIMATION_CHANNEL_ID', null, { root: true });
      await dispatch('initial', null, { root: true });
    }

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
        await dispatch('setOnlineStatusSleep', true);
      }
    }

    /** Screen unlocked */
    if (!value && state.previousOnlineStatus === 'online') {
      await dispatch('setOnlineStatusSleep', false);
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
  microphoneState({ state, dispatch }, micState = !state.mediaState.microphone) {
    const newState = { ...state.mediaState };

    newState.microphone = micState;
    dispatch('setMediaState', newState);
  },

  /**
   * Muted by user
   * @param {function} dispatch – vuex dispatch
   * @param {boolean} userId – microphone state
   * @returns {void}
   */
  async mutedByUser({ dispatch }, userId) {
    /** Prevent muted talk push */
    broadcastEvents.dispatch('audio-check-skip-muted-talk');

    dispatch('microphoneState', false);

    /** Show push */
    await dispatch('app/addPush', {
      inviteId: Date.now().toString(),
      local: true,
      message: { action: 'mutedForAll' },
      userId,
    }, { root: true });
  },

  /**
   * Update social data
   * @param {function} commit – vuex commit
   * @param {object} data – me data
   * @returns {void}
   */
  async updateSocial({ commit }, data) {
    const filteredData = {
      socialAuth: data.socialAuth,
    };

    commit('UPDATE', filteredData);
  },

  /**
   * Detach social network
   * @param {function} dispatch – vuex dispatch
   * @param {string} socialName – social name
   * @returns {void}
   */
  async detachSocial({ dispatch }, socialName) {
    await API.auth.detachSocial(socialName);
  },

  setChannelId({ commit }, id) {
    commit('app/ANIMATION_CHANNEL_ID', id, { root: true });
    commit('SET_CHANNEL_ID', id);
  },

  /**
   * Start face monitoring and stop camera sharing when face is gone for too long
   * @param {function} dispatch – vuex dispatch
   * @param {MediaStream} stream – camera stream
   * @param {MeState} state – vuex state
   * @returns {void}
   */
  async startFaceMonitoring({ dispatch, state }, stream) {
    faceDetection.start(stream);

    faceDetection.on('no-face-too-long', () => {
      dispatch('setMediaState', {
        ...state.mediaState,
        camera: false,
      });

      const push = {
        inviteId: 'id-' + Date.now(),
        local: true,
        name: 'cameraStopped',
        message: { action: 'cameraStopped' },
      };

      dispatch('app/addPush', push, { root: true });
    });
  },

  /**
   * Stop face monitoring
   * @returns {void}
   */
  async stopFaceMonitoring() {
    faceDetection.stop();
    faceDetection.removeAllListeners('no-face-too-long');
  },
};
