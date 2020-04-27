import userApi from './user';
import authApi from './auth';
import workspaceApi from './workspace';
import channelApi from './channel';
import { errorMessages } from './errors/types';
import { handleError } from './errors';
import axios from 'axios';
import { updateTokens } from './tokens';
import store from '@/store';

const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
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
    store.dispatch('app/addPrivacyLog', {
      category: 'api',
      method: functionName,
      data: Array.prototype.slice.call(arguments),
    });

    try {
      return await func.apply(null, arguments);
    } catch (err) {
      /** Update tokens if token is expired */
      if (err.response.data.message === errorMessages.accessTokenExpired) {
        await updateTokens();

        return middleware(func).apply(null, arguments);
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
};
