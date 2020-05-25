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
import broadcastActions from '@classes/broadcastActions';
import isMainWindow from '@shared/WindowManager/isMainWindow';
import broadcastState from '../classes/broadcastState';

const debug = process.env.NODE_ENV !== 'production';

const plugins = [
  createMutationsSharer({
    predicate: [
      'me/SET_MEDIA_STATE',
      'me/SET_CHANNEL_ID',
      'channels/ADD_USER',
      'channels/REMOVE_USER',
      'channels/SET_USER_MEDIA_STATE',
      // 'app/SET_MICROPHONE_VOLUME',
    ],
  }),
];

if (debug) {
  plugins.push(createLogger({
    /**
     * Filter mutations to be logged
     * @param {object} mutation Mutation type and payload
     * @returns {boolean}
     */
    filter(mutation) {
      const ignoreList = [
        'app/SET_MICROPHONE_VOLUME',
      ];

      return !ignoreList.includes(mutation.type);
    },
    logActions: false,
  }));
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
if (isMainWindow()) {
  broadcastActions.on('action', ({ action, data }) => {
    store.dispatch(action, data);
  });

  /** Used for new windows to get actual state */
  broadcastState.on('state-request', (state) => {
    broadcastState.resolveState(store.state);
  });
} else {
  /** Request state */
  console.log('REQUEST STATE');
  broadcastState.requestState();

  /** Listen to state event and replace state */
  broadcastState.once('state', (state) => {
    store.replaceState(state);
  });
}

export default store;
