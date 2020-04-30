import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import modules from './modules';
import actions from './actions';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import mediaDevices from '@classes/mediaDevices';
import createMutationsSharer from 'vuex-shared-mutations';
import Store from 'electron-store';
import broadcastActions from '@classes/broadcastActions';

const stateStore = new Store({
  name: 'state',
});

const debug = process.env.NODE_ENV !== 'production';

const plugins = [
  createMutationsSharer({
    predicate: [
      'me/SET_MEDIA_STATE',
      'me/SET_CHANNEL_ID',
      'channels/ADD_USER',
      'channels/REMOVE_USER',
      'channels/SET_USER_MEDIA_STATE',
    ],
  }),
];

if (debug) {
  plugins.push(createLogger());
}

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  state,
  mutations,
  actions,
  getters,
  strict: debug,
  plugins,
});

/**
 * Used for new windows to get actual state from local store
 * @see WindowManagerRenderer
 */
if (stateStore.has('state')) {
  store.replaceState(stateStore.get('state'));
  stateStore.delete('state');
}

/**
 * Listen for device change event
 */
mediaDevices.on('change', (devices) => {
  store.commit('app/SET_DEVICES', devices);
});

/**
 * Listen for bluetooth microphone becomes default
 */
mediaDevices.on('bluetooth-microphone', (microphone) => {
  console.log('bluetooth microphone detected', microphone);
});

/**
 * Listen for broadcasted actions and dispatch them
 */
broadcastActions.on('action', ({ action, data }) => {
  store.dispatch(action, data);
});

export default store;
