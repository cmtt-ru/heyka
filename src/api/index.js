/* eslint-disable require-jsdoc */

import userApi from './user';
import authApi from './auth';
import workspaceApi from './workspace';
import channelApi from './channel';
import * as ERROR from './constants';
import refreshToken from './auth/refreshToken';
import axios from 'axios';
import Store from 'electron-store';
const AuthFileStore = new Store({
  name: 'auth',
  encryptionKey: '1234543',
});

const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  axios.defaults.baseURL = process.env.VUE_APP_DEV_URL;
} else {
  axios.defaults.baseURL = process.env.VUE_APP_PROD_URL;
}

if (AuthFileStore.has('accessToken')) {
  setAxiosTokenHeader(AuthFileStore.get('accessToken'));
}

function setAxiosTokenHeader(token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

async function updateToken() {
  let { accessToken: ACCESS, refreshToken: REFRESH } = AuthFileStore.store;

  const res = await refreshToken({
    accessToken: ACCESS,
    refreshToken: REFRESH,
  });

  ACCESS = res.data.accessToken;
  REFRESH = res.data.refreshToken;

  setAxiosTokenHeader(ACCESS);
  AuthFileStore.set('accessToken', ACCESS);
  AuthFileStore.set('refreshToken', REFRESH);
}

function injectMidleware(functions) {
  Object.keys(functions).forEach(name => {
    const origFunc = functions[name];

    functions[name] = middleware(origFunc);
  });

  return functions;
}
function middleware(func) {
  return async function () {
    try {
      // console.time(name);
      const res = await func.apply(null, arguments);

      // console.timeEnd(name);

      return res;
    } catch (err) {
      switch (true) {
        case err.response === undefined:
          throw err;
        case err.response.data.message === ERROR.BAD_TOKEN :
          break;
        case err.response.data.message === ERROR.EXPIRED_TOKEN :
          await updateToken();

          return middleware(func).apply(null, arguments);
      }
    }
  };
};

export default {
  user: injectMidleware(userApi),
  auth: injectMidleware(authApi),
  workspace: injectMidleware(workspaceApi),
  channel: injectMidleware(channelApi),
};