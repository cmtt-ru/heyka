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
  client.on(eventNames.userSelectedChannel, data => {
    console.log(data);
  });

  client.on(eventNames.userUnselectedChannel, data => {
    console.log(data);
  });
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
