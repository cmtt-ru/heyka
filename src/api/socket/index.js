import store from '@/store';
import eventNames from './eventNames';
import { client, connect } from './client';
import { getAccessToken } from '../tokens';

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

  /** Channel select/unselect  */
  bindChannelEvents();

  /** User events */
  bindUserEvents();
})();

/**
 * Authorize in socket
 *
 * @returns {promise}
 */
async function authorize() {
  const accessToken = await getAccessToken();

  return new Promise((resolve, reject) => {
    client.emit(eventNames.auth, {
      transaction: 'auth',
      workspaceId: store.getters['me/getSelectedWorkspaceId'],
      token: accessToken,
      // todo: online status
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
  /**
   * Data buffer with delay
   *
   * @type {object}
   */
  const dataBuffer = {
    timeout: 100,

    buffer: {},

    add(id, data) {
      this.buffer[id] = {
        data,
        timer: null,
      };
    },

    remove(id) {
      this.cancelDelay(id);
      delete this.buffer[id];
    },

    get(id) {
      return this.buffer[id] && this.buffer[id].data;
    },

    delay(id, callback) {
      this.buffer[id].timer = setTimeout(callback, this.timeout);
    },

    cancelDelay(id) {
      clearInterval(this.buffer[id].timer);
    },
  };

  /** Unselect channel */
  client.on(eventNames.userUnselectedChannel, data => {
    const userId = data.userId;

    dataBuffer.add(userId, data);

    dataBuffer.delay(userId, () => {
      dataBuffer.remove(userId);
      store.commit('channels/REMOVE_USER', data);
      store.commit('me/SET_CHANNEL_ID', null);
    });
  });

  /** Select channel */
  client.on(eventNames.userSelectedChannel, data => {
    const userId = data.userId;
    const unselectData = dataBuffer.get(userId);

    if (unselectData) {
      store.commit('channels/REMOVE_USER', unselectData);
      dataBuffer.remove(userId);
    }

    store.commit('channels/ADD_USER', data);
    store.commit('me/SET_CHANNEL_ID', data.channelId);
  });
}

/**
 * Bind user events
 *
 * @returns {void}
 */
function bindUserEvents() {
  /** User online status changed */
  client.on(eventNames.onlineStatusChanged, data => {
    store.commit('users/SET_ONLINE_STATUS', data);
  });

  /** User media status changed */
  client.on(eventNames.mediaStateUpdated, data => {
    store.commit('channels/SET_USER_MEDIA_STATE', data);
  });
}
