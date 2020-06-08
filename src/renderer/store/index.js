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
import broadcastEvents from '@classes/broadcastEvents';
import isMainWindow from '@shared/WindowManager/isMainWindow';
import broadcastState from '@classes/broadcastState';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

const heykaStore = new Store({
  name: 'app',
});

const debug = process.env.NODE_ENV !== 'production';

const plugins = [
  createMutationsSharer({
    predicate: [
      'app/SET_SELECTED_DEVICES',
      'janus/SET_IN_PROGRESS',
      'me/SET_MEDIA_STATE',
      'me/SET_CHANNEL_ID',
      'channels/ADD_USER',
      'channels/REMOVE_USER',
      'channels/SET_USER_MEDIA_STATE',
      'app/SET_MICROPHONE_VOLUME',
      'app/ADD_PUSH',
      'app/REMOVE_PUSH',
      'app/SET_DEVICES',
    ],
  }),
];

if (!debug) {
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
 * Listen for FIRST device change event to set selected devices
 */
mediaDevices.once('change', (devices) => {
  const selectedDevices = {
    speaker: heykaStore.get('selectedSpeaker', 'default'),
    microphone: heykaStore.get('selectedMicrophone', 'default'),
    camera: heykaStore.get('selectedCamera', ''),
  };

  store.dispatch('app/setSelectedDevices', selectedDevices);
});

/**
 * Listen for device change event
 */
mediaDevices.on('change', (devices) => {
  store.commit('app/SET_DEVICES', devices);

  /* re-set default devices if previous id's are not found */
  if (!state.app.devices.speakers.map(el => el.id).includes(state.app.selectedDevices.speaker)) {
    const data = { ...state.app.selectedDevices };

    data.speaker = 'default';
    store.dispatch('app/setSelectedDevices', data);
  }
  if (!state.app.devices.microphones.map(el => el.id).includes(state.app.selectedDevices.microphone)) {
    const data = { ...state.app.selectedDevices };

    data.microphone = 'default';
    store.dispatch('app/setSelectedDevices', data);
  }
  if (!state.app.devices.cameras.map(el => el.id).includes(state.app.selectedDevices.camera)) {
    const data = { ...state.app.selectedDevices };

    if (state.app.devices.cameras[0]) {
      data.camera = state.app.devices.cameras[0].id;
    } else {
      data.camera = '';
    }
    store.dispatch('app/setSelectedDevices', data);
  }
});

/**
 * Listen for bluetooth microphone becomes default
 */
mediaDevices.on('bluetooth-microphone', (microphone) => {
  console.log('bluetooth microphone detected', microphone);
});

/**
 * Window specific code
 */
if (isMainWindow()) {
  /** Listen for broadcasted actions and dispatch them */
  broadcastActions.on('action', ({ action, data }) => {
    store.dispatch(action, data);
  });

  /** Used for new windows to get actual state */
  broadcastState.on('state-request', (state) => {
    broadcastState.resolveState(store.state);
  });

  /**
   * Handle power monitor events
   */
  /** Sleep / Awake */
  ipcRenderer.on('power-monitor-suspend', (event, state) => {
    store.dispatch('me/setSuspendState', state);
  });

  /** Lock / Unlock screen */
  ipcRenderer.on('power-monitor-lock-screen', (event, state) => {
    store.dispatch('me/setLockScreenState', state);
  });
} else {
  /** Request state */
  broadcastState.requestState();

  /** Listen to state event and replace state */
  broadcastState.once('state', (state) => {
    store.replaceState(state);
  });
}

broadcastEvents.on('shared-action', ({ action, data }) => {
  store.dispatch(action, data);
});

export default store;
