import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import modules from './modules';
import actions from './actions';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import mediaDevices from '@sdk/classes/mediaDevices';
import createMutationsSharer from 'vuex-shared-mutations';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import isMainWindow from '@shared/WindowManager/isMainWindow';
import broadcastState from '@sdk/classes/broadcastState';
import { ipcRenderer } from 'electron';
import createPersistedState from 'vuex-persistedstate';
import { heykaStore } from '@/store/localStore';
import cloneDeep from 'clone-deep';
import { throttle } from 'throttle-debounce';
import Logger from '@sdk/classes/logger';

const cnsl = new Logger('Vuex index', '#17A589');

/**
 * Is this window main?
 * * @type {boolean}
 */
const IS_MAIN_WINDOW = isMainWindow();

/**
 * Vuex plugins
 * @type {array}
 */
const plugins = [
  createMutationsSharer({
    predicate: [
      'app/SET_SELECTED_DEVICES',
      'app/SET_MICROPHONE_VOLUME',
      'app/ADD_PUSH',
      'app/REMOVE_PUSH',
      'app/SET_DEVICES',
      'app/SET_CLOSE_OVERLAY_BUTTON',
      'janus/SET_IN_PROGRESS',
      'me/SET_MEDIA_STATE',
      'me/SET_CHANNEL_ID',
      'me/SET_USER_ID',
      'me/SET_ALLOW_DRAW',
      'users/UPDATE_USER',
      'users/SET_COLLECTION',
      'channels/ADD_USER',
      'channels/REMOVE_USER',
      'channels/SET_USER_MEDIA_STATE',
      'channels/ADD_CHANNEL',
      'channels/REMOVE_CHANNEL',
      'janus/SET_OPTIONS',
      'janus/SET_SHARING_SOURCE',
    ],
  }),
];

/**
 * Vuex logger plugin
 */
if (!IS_DEV) {
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

/**
 * Vuex persisted state plugin
 */
if (IS_MAIN_WINDOW) {
  const persistStorePaths = [
    'channels',
    'users',
    'workspaces',
  ];

  const allowedMutationsList = [
    'channels/SET_COLLECTION',
    'channels/ADD_CHANNEL',
    'channels/REMOVE_CHANNEL',
    'users/SET_COLLECTION',
    'users/SET_ONLINE_STATUS',
    'workspaces/SET_COLLECTION',
  ];

  const THROTTLE_DELAY = 1000;

  plugins.push(createPersistedState({
    paths: persistStorePaths,
    filter: mutation => {
      return allowedMutationsList.includes(mutation.type);
    },
    reducer: state => {
      const reducedState = cloneDeep({
        channels: state.channels,
        workspaces: state.workspaces,
        users: state.users,
      });

      /** Remove users from channel */
      for (const key in reducedState.channels.collection) {
        reducedState.channels.collection[key].users = [];
      }

      /** Offline status for all users */
      for (const key in reducedState.users.collection) {
        reducedState.users.collection[key].onlineStatus = 'offline';
      }

      return reducedState;
    },
    setState: throttle(THROTTLE_DELAY, false, (key, state, storage) => {
      storage.setItem(key, JSON.stringify(state));
    }),
  }));
}

Vue.use(Vuex);

/**
 * Vuex store
 * @type {Store}
 */
const store = new Vuex.Store({
  modules,
  state,
  mutations,
  actions,
  getters,
  strict: IS_DEV,
  plugins,
});

/**
 * Window specific code
 */
if (IS_MAIN_WINDOW) {
  /**
   * Listen for bluetooth microphone becomes default
   */
  mediaDevices.on('bluetooth-microphone', (microphone) => {
    cnsl.log('bluetooth microphone detected', microphone);
  });

  /**
   * Listen for device change event
   */
  let selectedDevicesLoaded = false;

  mediaDevices.on('change', (devices) => {
    store.commit('app/SET_DEVICES', devices);

    let selectedDevices;

    if (!selectedDevicesLoaded) {
      selectedDevices = {
        // speaker: heykaStore.get('selectedSpeaker', 'default'),
        // microphone: heykaStore.get('selectedMicrophone', 'default'),
        // camera: heykaStore.get('selectedCamera', ''),
        speaker: 0,
        microphone: 0,
        camera: 0,
      };

      let speakerDevice = store.getters['app/getDevice']('speakers', selectedDevices.speaker);
      let microphoneDevice = store.getters['app/getDevice']('microphones', selectedDevices.microphone);
      let cameraDevice = store.getters['app/getDevice']('cameras', selectedDevices.camera);

      if (!speakerDevice) {
        const speakerDeviceLabel = heykaStore.get('selectedSpeakerLabel', 'default');

        speakerDevice = store.getters['app/getDeviceByLabel']('speakers', speakerDeviceLabel);

        if (speakerDevice) {
          selectedDevices.speaker = speakerDevice.id;
        }
      }

      if (!microphoneDevice) {
        const microphoneDeviceLabel = heykaStore.get('selectedMicrophoneLabel');

        microphoneDevice = store.getters['app/getDeviceByLabel']('microphones', microphoneDeviceLabel);

        if (microphoneDevice) {
          selectedDevices.microphone = microphoneDevice.id;
        }
      }

      if (!cameraDevice) {
        const cameraDeviceLabel = heykaStore.get('selectedCameraLabel');

        cameraDevice = store.getters['app/getDeviceByLabel']('cameras', cameraDeviceLabel);

        if (cameraDevice) {
          selectedDevices.camera = cameraDevice.id;
        }
      }

      store.dispatch('app/setSelectedDevices', selectedDevices);

      console.log('selectedDevices', selectedDevices);

      selectedDevicesLoaded = true;
    } else {
      selectedDevices = { ...state.app.selectedDevices };
    }

    /* re-set default devices if previous id's are not found */
    if (!state.app.devices.speakers.map(el => el.id).includes(state.app.selectedDevices.speaker)) {
      selectedDevices.speaker = 'default';
    }
    if (!state.app.devices.microphones.map(el => el.id).includes(state.app.selectedDevices.microphone)) {
      selectedDevices.microphone = 'default';
    }
    if (!state.app.devices.cameras.map(el => el.id).includes(state.app.selectedDevices.camera)) {
      if (state.app.devices.cameras[0]) {
        selectedDevices.camera = state.app.devices.cameras[0].id;
      } else {
        selectedDevices.camera = '';
      }
    }

    store.dispatch('app/setSelectedDevices', selectedDevices);
  });

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
