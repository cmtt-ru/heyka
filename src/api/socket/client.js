import io from 'socket.io-client';
import eventNames from './eventNames';

const isDevelopment = process.env.NODE_ENV !== 'production';

let socketUrl = process.env.VUE_APP_PROD_URL;

if (isDevelopment) {
  socketUrl = process.env.VUE_APP_DEV_URL;
}

const client = io.connect(socketUrl);

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
