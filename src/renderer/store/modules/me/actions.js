import API from '@api';
import Store from 'electron-store';
import callWindow from '@classes/callWindow';

const meStore = new Store({
  name: 'store-module-me',
});

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
    }

    commit('SET_MEDIA_STATE', mediaState);

    try {
      meStore.set('mediaState', mediaState);
    } catch (err) {
      console.log(err);
    }

    if (selectedChannelId) {
      await API.user.setMediaState(mediaState);
    }
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
};
