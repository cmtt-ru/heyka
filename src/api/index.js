import userApi from './user';
import authApi from './auth';
import workspaceApi from './workspace';
import channelApi from './channel';
import * as ERROR from './constants';
import axios from 'axios';
import { updateTokens } from './tokens';

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

    functions[name] = middleware(origFunc);
  });

  return functions;
}

/**
 * Middleware function
 *
 * @param {function} func – specific function
 * @returns {function(...[*]=)}
 */
function middleware(func) {
  return async function () {
    try {
      return await func.apply(null, arguments);
    } catch (err) {
      switch (true) {
        case err.response === undefined:
          throw err;
        case err.response.data.message === ERROR.BAD_TOKEN :
          break;
        case err.response.data.message === ERROR.EXPIRED_TOKEN :
          await updateTokens();

          return middleware(func).apply(null, arguments);
        default:
          throw err;
      }
    }
  };
}

export default {
  user: injectMiddleware(userApi),
  auth: injectMiddleware(authApi),
  workspace: injectMiddleware(workspaceApi),
  channel: injectMiddleware(channelApi),
};
