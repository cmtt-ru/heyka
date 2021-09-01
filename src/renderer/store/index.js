import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import actions from './actions';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import mediaDevices from '@sdk/classes/mediaDevices';
import createMutationsSharer, { BroadcastChannelStrategy } from 'vuex-shared-mutations';
import broadcastActions from '@sdk/classes/broadcastActions';
import broadcastEvents from '@sdk/classes/broadcastEvents';
import isMainWindow from '@sdk/libs/isMainWindow';
import broadcastState from '@sdk/classes/broadcastState';
import createPersistedState from 'vuex-persistedstate';
import cloneDeep from 'clone-deep';
import { throttle } from 'throttle-debounce';
import Logger from '@sdk/classes/logger';
import router from '@/router';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';

/**
 * Enable this code for deep store debugging
 */
// import { measureModules } from '@libs/vuexMeasurer';
//
// measureModules(modules);
// measureModules({
//   root: {
//     actions,
//     getters,
//     mutations,
//   },
// });

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
      'me/getSelectedChannelId',
      'users/UPDATE_USER',
      'users/ADD_USER',
      'users/REMOVE_USER',
      'users/SET_COLLECTION',
      'channels/UPDATE_CHANNEL',
      'channels/ADD_USER',
      'channels/REMOVE_USER',
      'channels/SET_USER_MEDIA_STATE',
      'channels/ADD_CHANNEL',
      'channels/ADD_CONVERSATION_DATA',
      'channels/REMOVE_CONVERSATION_DATA',
      'channels/CLEAR_CONVERSATION_DATA',
      'channels/ADD_CONVERSATION_EVENT',
      'channels/CLEAR_CONVERSATION_EVENTS',
      'channels/REMOVE_CHANNEL',
      'channels/SET_MINI_CHAT_READ_TIMESTAMP',
      'janus/SET_OPTIONS',
      'janus/SET_SHARING_SOURCE',
    ],
    strategy: new BroadcastChannelStrategy({ key: 'vuex' }),
  }),

];

/**
 * Vuex logger plugin
 */
if (!IS_DEV) {
  plugins.push(store => {
    const ignoreList = [
      'app/SET_MICROPHONE_VOLUME',
      'me/SET_MEDIA_STATE',
      'channels/SET_USER_MEDIA_STATE',
    ];

    const payloadIgnoreList = [
      'channels/SET_COLLECTION',
      'users/SET_COLLECTION',
    ];

    store.subscribe((mutation, state) => {
      if (!ignoreList.includes(mutation.type)) {
        let payload = mutation.payload;

        if (payloadIgnoreList.includes(mutation.type)) {
          payload = 'ignored payload';
        }

        console.log(`%cmutation ${mutation.type}`, 'font-weight:bold', payload);
      }
    });
  });
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

  mediaDevices.on('change', (devices) => {
    store.dispatch('app/setDevices', devices);
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
  window.ipcRenderer.on('power-monitor-suspend', (event, state) => {
    store.dispatch('me/setSuspendState', state);
  });

  /** Lock / Unlock screen */
  window.ipcRenderer.on('power-monitor-lock-screen', (event, state) => {
    store.dispatch('me/setLockScreenState', state);
  });

  /** Listen for esc+esc+esc hot key */
  broadcastEvents.on('go-to-support', () => {
    const mainWindow = WindowManager.getCurrentWindow();

    router.push({ name: 'settings-support' }).catch(() => {});

    mainWindow.api('show');
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

/** Listen specific window event and navigate with router */
broadcastEvents.on(`window-router-push-${WindowManager.getCurrentWindowId()}`, routerParams => {
  router.push(routerParams).catch(() => {});
});

export default store;
