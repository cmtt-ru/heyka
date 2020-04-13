import io from 'socket.io-client';

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

    client.on('connect', data => {
      resolve(data);
    });

    client.on('connect_error', data => {
      reject(data);
    });
  });
}

export {
  client,
  connect
};
