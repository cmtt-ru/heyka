import API from '@api';
import Store from 'electron-store';
import callWindow from '@classes/callWindow';
import sleep from 'es7-sleep';

const meStore = new Store({
  name: 'store-module-me',
});

/**
 * Used when user want to switch from camera to screen or vice versa
 * @type {number}
 */
const MEDIA_STATE_DELAY = 100;

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

      /** Set media state of camera & screen to false */
      commit('SET_MEDIA_STATE', {
        ...state.mediaState,
        camera: false,
        screen: false,
      });

      await sleep(MEDIA_STATE_DELAY);
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
    await API.user.setOnlineStatus(status);
    meStore.set('onlineStatus', status);
  },
};
