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

  async setMediaState({ commit }, mediaState) {
    commit('SET_MEDIA_STATE', mediaState);
    meStore.set('mediaState', mediaState);
    await API.user.setMediaState(mediaState);
  },

};
