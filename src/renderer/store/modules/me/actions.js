import API from '@api';
import Store from 'electron-store';

const meStore = new Store({
  name: 'store-module-me',
});

export default {
  /**
   * Set selected workspace id
   *
   * @param {function} commit – store commit
   * @param {string} id – workspace id
   * @return {void}
   */
  setSelectedWorkspaceId({ commit }, id) {
    commit('SET_WORKSPACE_ID', id);
    meStore.set('selectedWorkspaceId', id);
  },

  /**
   * Set our new media state
   *
   * @param {function} commit – store commit
   * @param {function} getters – store getters
   * @param {object} mediaState – new mediaState
   * @return {void}
   */
  async setMediaState({ commit, getters }, mediaState) {
    const selectedChannelId = getters['getSelectedChannelId'];

    commit('SET_MEDIA_STATE', mediaState);
    meStore.set('mediaState', mediaState);

    if (selectedChannelId) {
      await API.user.setMediaState(mediaState);
    }
  },

};
