import io from 'socket.io-client';
import eventNames from './eventNames';
import { IS_DEV } from '../../shared/Constants';

let socketUrl = process.env.VUE_APP_PROD_URL;

if (IS_DEV) {
  socketUrl = process.env.VUE_APP_DEV_URL;
}

const client = io(socketUrl, { autoConnect: false });

/**
 * Connect to socket
 *
 * @returns {promise}
 */
function connect() {
  return new Promise((resolve, reject) => {
    if (client.connected) {
      resolve();

      return;
    }

    if (client.disconnected) {
      client.connect();
    }

    client.once('connect', data => {
      client.lastSocketId = client.id;
      resolve(data);
    });

    client.once(eventNames.connectError, data => {
      reject(data);
    });
  });
}

export {
  client,
  connect
};
