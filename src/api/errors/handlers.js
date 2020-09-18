import { errorMessages } from './types';
import logout from '@api/auth/logout';
import connectionCheck from '@sdk/classes/connectionCheck';
import Logger from '@sdk/classes/logger';
const cnsl = new Logger('api errors', '#CD5C5C');

export const errorHandlers = {};

/**
 * Bad token
 */
defineErrorHandler(errorMessages.badToken, error => {
  logout();

  throw error;
});

/**
 * Credentials are invalid
 */
defineErrorHandler(errorMessages.credentialsAreInvalid, error => {
  logout();

  throw error;
});

/**
 * Refresh token expired
 */
defineErrorHandler(errorMessages.refreshTokenExpired, error => {
  logout();

  throw error;
});

/**
 * Missing authentication
 */
defineErrorHandler(errorMessages.missingAuthentication, error => {
  logout();

  throw error;
});

/**
 * Invalid request payload input
 */
defineErrorHandler(errorMessages.invalidRequestPayloadInput, error => {
  // logout();

  throw error;
});

/**
 * Internal server error
 */
defineErrorHandler(errorMessages.internalServerError, error => {
  /** Show fancy error */
  cnsl.error('500\nInternal server error');
  cnsl.log(error);

  throw error;
});

/**
 * Socket not found
 */
defineErrorHandler(errorMessages.socketNotFound, error => {
  /** Show fancy error */
  cnsl.error('Huh, socket not found');
  cnsl.log(error);

  throw error;
});

/**
 * Access denied
 */
defineErrorHandler(errorMessages.accessDenied, error => {
  /** Show fancy error */
  cnsl.error('It seems you don\'t have access');
  cnsl.log(error);

  throw error;
});

/**
 * Server is down
 */
defineErrorHandler(errorMessages.serverIsDown, error => {
  connectionCheck.handleServerAvailability(false);

  throw error;
});

/**
 * Define error handler
 *
 * @param {string} errorMessage – error message
 * @param {function} handler – handler function
 * @returns {void}
 */
export function defineErrorHandler(errorMessage, handler) {
  errorHandlers[errorMessage.toLowerCase()] = handler;
}
