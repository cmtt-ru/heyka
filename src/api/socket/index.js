import store from '@/store';
import eventNames from './eventNames';
import { client, connect } from './client';
import { getAccessToken } from '../tokens';
import connectionCheck from '@classes/connectionCheck';

const DISCONNECT_TIMEOUT = 2000;

/**
 * Connect to socket, authorize and bind events
 *
 * @returns {Promise<void>}
 */
export async function init() {
  /** Trying to connect */
  try {
    await connect();
  } catch (e) {
    console.error(e);
  }

  /** Bind error events */
  bindErrorEvents();

  /** Channel select/unselect  */
  bindChannelEvents();

  /** User events */
  bindUserEvents();

  /** Push events */
  bindPushEvents();

  /** Trying to authorize */
  try {
    await authorize();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Destroy socket connection and unbind events
 *
 * @returns {Promise<void>}
 */
export async function destroy() {
  client.disconnect();

  Object.values(eventNames).forEach(eventName => {
    client.removeAllListeners(eventName);
  });
}

/**
 * Authorize in socket
 *
 * @param {string?} prevSocketId Previous socket id
 * @returns {promise}
 */
async function authorize(prevSocketId) {
  const accessToken = await getAccessToken();
  const onlineStatus = store.getters['me/getOnlineStatus'];

  return new Promise((resolve, reject) => {
    client.once(eventNames.authSuccess, data => {
      console.log('socket auth success', data);
      store.dispatch('setSocketConnected', data);
      resolve(data);
    });

    client.once(eventNames.authSuccessError, data => {
      console.error('socket auth error', data);
      reject(data);
    });

    const authData = {
      transaction: 'auth',
      workspaceId: store.getters['me/getSelectedWorkspaceId'],
      token: accessToken,
      onlineStatus: onlineStatus,
      ...(prevSocketId ? { prevSocketId } : prevSocketId),
    };

    console.log('Auth with data', authData);
    client.emit(eventNames.auth, authData);

    store.dispatch('app/addPrivacyLog', {
      category: 'socket',
      method: eventNames.auth,
      data: [ store.getters['me/getSelectedWorkspaceId'] ],
    });
  });
}

/**
 * Bind error events
 *
 * @returns {void}
 */
function bindErrorEvents() {
  const socketId = client.id;

  client.on(eventNames.disconnect, data => {
    console.log('disconnect', data);
    store.dispatch('setSocketConnected', false);

    // remember latest socket id
    console.log('prevSocketParam: ', socketId, client, Date.now());
    store.commit('app/SET_SOCKET_ID', {
      id: socketId,
      connectedAt: Date.now(),
    });
  });

  client.on(eventNames.reconnecting, data => {
    connectionCheck.handleSocketReconnecting(true);
  });

  client.on(eventNames.reconnect, data => {
    console.log('%c reconnected:', 'background: maroon; color: white', data);
    connectionCheck.handleSocketReconnecting(false);

    const prevSocketParams = store.state.app.socket;

    console.log(prevSocketParams);

    const timeFromLastSocketConnected = Date.now() - parseInt(prevSocketParams.connectedAt);

    if (timeFromLastSocketConnected < DISCONNECT_TIMEOUT) {
      authorize(prevSocketParams.id);
    } else {
      authorize();
    }
  });

  setTimeout(() => {
    client.disconnect();
    client.connect();
  }, parseInt('5000'));

  client.on(eventNames.error, data => {
    console.error('error', data);
  });

  client.on(eventNames.socketApiError, error => {
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
    // Перемещение пользователя между каналами осуществляется
    // методами selectChannel/unselectChannel
    if (data.socketId === client.id) {
      return;
    }

    const userId = data.userId;

    dataBuffer.add(userId, data);

    dataBuffer.delay(userId, () => {
      dataBuffer.remove(userId);
      store.commit('channels/REMOVE_USER', data);
    });
  });

  /** Select channel */
  client.on(eventNames.userSelectedChannel, data => {
    if (data.socketId === client.id) {
      return;
    }

    const userId = data.userId;
    const unselectData = dataBuffer.get(userId);

    if (unselectData) {
      store.commit('channels/REMOVE_USER', unselectData);
      dataBuffer.remove(userId);
    }

    store.commit('channels/ADD_USER', data);
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

/**
 * Bind push events
 *
 * @returns {void}
 */
function bindPushEvents() {
  /** Get push notification */
  client.on(eventNames.message, data => {
    store.dispatch('app/addPush', data);
  });

  /** Get response to push notification */
  client.on(eventNames.messageResponse, ({ messageId, userId, response }) => {
    if (response.showResponse) {
      store.dispatch('app/addPush', {
        messageId,
        userId,
        message: response,
      });
    } else if (response === 'no-response') {
      store.dispatch('app/addPush', {
        messageId: `response-${messageId}`,
        userId,
        message: response,
      });
    }
  });
}
