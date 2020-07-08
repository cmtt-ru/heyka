import store from '@/store';
import eventNames from './eventNames';
import { client, connect } from './client';
import { getAccessToken } from '../tokens';
import connectionCheck from '@classes/connectionCheck';
import { handleError } from '@api/errors';
import Logger from '@classes/logger';
const cnsl = new Logger('SOCKETS', '#d67a24');

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
    handleError(e);
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
    handleError(e);
  }
}

/**
 * Save current socket id and time
 *
 * @return {void}
 */
export async function saveSocketParams() {
  store.commit('app/SET_SOCKET_ID', {
    id: client.lastSocketId,
    connectedAt: Date.now(),
  });
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
      cnsl.log('socket auth success:', data);
      store.dispatch('setSocketConnected', {
        connected: true,
        ...data,
      });
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
  client.on(eventNames.disconnect, data => {
    cnsl.log('disconnect', data);
    store.dispatch('setSocketConnected', false);

    // remember latest socket id
    saveSocketParams();
  });

  client.on(eventNames.reconnecting, data => {
    connectionCheck.handleSocketReconnecting(true);
  });

  client.on(eventNames.reconnect, data => {
    // rewrite last socket id
    client.lastSocketId = client.id;

    cnsl.info('reconnected:', data);
    connectionCheck.handleSocketReconnecting(false);

    // try to authorize new connection as the old connection
    const prevSocketParams = store.state.app.socket;

    const timeFromLastSocketConnected = Date.now() - parseInt(prevSocketParams.connectedAt);

    if (timeFromLastSocketConnected < DISCONNECT_TIMEOUT) {
      authorize(prevSocketParams.id);
    } else {
      authorize();
    }
  });

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

    const myUserId = store.getters['me/getMyId'];
    const userId = data.userId;
    const unselectData = dataBuffer.get(userId);

    /** Same user is trying to join from another device */
    if (data.socketId !== client.id && myUserId === userId) {
      const selectedChannelId = store.getters['me/getSelectedChannelId'];

      store.dispatch('unselectChannelWithoutAPICall', selectedChannelId);
    }

    if (unselectData) {
      store.commit('channels/REMOVE_USER', unselectData);
      dataBuffer.remove(userId);
    }

    store.commit('channels/ADD_USER', data);
  });

  /** Channel created */
  client.on(eventNames.channelCreated, async (data) => {
    store.dispatch('channels/addChannel', data.channelId);
  });

  /** Channel deleted */
  client.on(eventNames.channelDeleted, ({ channelId }) => {
    store.commit('channels/REMOVE_CHANNEL', channelId);
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
    if (response.showResponse || response === 'no-response') {
      store.dispatch('app/addPush', {
        messageId: `response-${messageId}`,
        userId,
        message: response,
      });
    }
  });

  /** Remove push notification */
  client.on(eventNames.messageCancelled, data => {
    store.dispatch('app/removePush', data.id);
  });
}
