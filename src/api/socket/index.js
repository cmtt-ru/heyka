import store from '@/store';
import eventNames from './eventNames';
import { client, connect } from './client';
import { getAccessToken } from './accessToken';

/**
 * Initialization
 */
(async () => {
  /** Trying to connect */
  try {
    await connect();
  } catch (e) {
    console.error(e);
  }

  /** Trying to authorize */
  try {
    await authorize();
  } catch (e) {
    console.error(e);
  }

  /** Bind error events */
  bindErrorEvents();

  /** User select/unselect channel */
  bindChannelEvents();
})();

/**
 * Authorize in socket
 *
 * @returns {promise}
 */
async function authorize() {
  return new Promise((resolve, reject) => {
    client.emit(eventNames.auth, {
      transaction: 'auth',
      workspaceId: store.getters['me/getSelectedWorkspaceId'],
      token: getAccessToken(),
      onlineStatus: 'online',
    });

    client.on(eventNames.authSuccess, data => {
      console.log('auth-success', data);
      resolve(data);
    });

    client.on('socket-api-error-auth', data => {
      console.log('auth-error', data);
      reject(data);
    });
  });
}

/**
 * Bind error events
 *
 * @returns {void}
 */
function bindErrorEvents() {
  client.on('disconnect', data => {
    console.log('disconnect', data);
  });

  client.on('reconnect', data => {
    console.log('reconnect', data);
  });

  client.on('error', data => {
    console.error('error', data);
  });

  client.on('socket-api-error', error => {
    console.error('socket-api-error', error.event, error.message);
  });
}

/**
 * Bind channel events
 *
 * @returns {void}
 */
function bindChannelEvents() {
  const mutationTimeout = 100;

  let mutationTimer;
  let unselectData = null;

  /** Select channel */
  client.on(eventNames.userUnselectedChannel, data => {
    unselectData = data;

    mutationTimer = setTimeout(() => {
      unselectData = null;

      store.commit('me/SET_CHANNEL_ID', null);
      store.commit('channels/REMOVE_USER', data);
    }, mutationTimeout);
  });

  /** Unselect channel */
  client.on(eventNames.userSelectedChannel, data => {
    clearTimeout(mutationTimer);

    if (unselectData) {
      store.commit('channels/REMOVE_USER', unselectData);
      unselectData = null;
    }

    store.commit('channels/ADD_USER', data);
    store.commit('me/SET_CHANNEL_ID', data.channelId);
  });
}
