import userApi from './user';
import authApi from './auth';
import workspaceApi from './workspace';
import channelApi from './channel';
import appApi from './app';
import { errorMessages } from './errors/types';
import { handleError } from './errors';
import trottleAPI from './throttle';
import axios from 'axios';
import { updateTokens, checkAndRefreshTokens } from './tokens';
import store from '@/store';
import connectionCheck from '@sdk/classes/connectionCheck';
import * as sockets from '@api/socket';
import { client } from './socket/client';

if (IS_DEV) {
  axios.defaults.baseURL = process.env.VUE_APP_DEV_URL;
} else {
  axios.defaults.baseURL = process.env.VUE_APP_PROD_URL;
}

/**
 * Inject's middleware function in all api methods
 *
 * @param {object} functions – object with functions
 * @returns {object}
 */
function injectMiddleware(functions) {
  Object.keys(functions).forEach(name => {
    const origFunc = functions[name];

    functions[name] = middleware(origFunc, name);
  });

  return functions;
}

/**
 * Middleware function
 *
 * @param {function} func – specific function
 * @param {string} functionName – function name
 * @returns {function(...[*]=)}
 */
function middleware(func, functionName) {
  return async function () {
    try {
      // throttle some of the API methods
      if (trottleAPI.needForThrottle(functionName)) {
        if (!trottleAPI.throttle(functionName)) {
          throw new Error(`${functionName} throttled`);
        }
      }

      if (!connectionCheck.isOnline()) {
        throw new Error(`Can't call API method '${functionName}'. No internet connection`);
      }

      store.dispatch('app/addPrivacyLog', {
        category: 'api',
        method: functionName,
        data: Array.prototype.slice.call(arguments),
      });

      connectionCheck.handleServerAvailability(true);

      await checkAndRefreshTokens();

      return await func.apply(null, arguments);
    } catch (err) {
      if (err.response === undefined) {
        await handleError(err);

        return;
      }

      /** Update tokens if token is expired */
      if (err.response.data.message === errorMessages.accessTokenExpired) {
        await updateTokens();

        return middleware(func, functionName).apply(null, arguments);
      }

      /** Try to reconnect sockets */
      if (err.response.data.message === errorMessages.socketNotFound || (client.id === undefined && client.connected === true)) {
        await sockets.reconnect();

        return middleware(func, functionName).apply(null, arguments);
      }

      /** Global error handler */
      await handleError(err);
    }
  };
}

export default {
  user: injectMiddleware(userApi),
  auth: injectMiddleware(authApi),
  workspace: injectMiddleware(workspaceApi),
  channel: injectMiddleware(channelApi),
  app: injectMiddleware(appApi),
};
