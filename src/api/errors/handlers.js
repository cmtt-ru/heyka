import { errorMessages } from './types';
import logout from '@api/auth/logout';

export const errorHandlers = {};

/**
 * Bad token
 */
defineErrorHandler(errorMessages.badToken, () => {
  logout();
});

/**
 * Credentials are invalid
 */
defineErrorHandler(errorMessages.credentialsAreInvalid, () => {
  logout();
});

/**
 * Refresh token expired
 */
defineErrorHandler(errorMessages.refreshTokenExpired, () => {
  logout();
});

/**
 * Missing authentication
 */
defineErrorHandler(errorMessages.missingAuthentication, () => {
  logout();
});

/**
 * Internal server error
 */
defineErrorHandler(errorMessages.internalServerError, error => {
  /** Show fancy error */
  alert('500\nInternal server error');
  console.log(error);
});

/**
 * Socket not found
 */
defineErrorHandler(errorMessages.socketNotFound, error => {
  /** Show fancy error */
  alert('Huh, socket not found');
  console.log(error);
});

/**
 * Access denied
 */
defineErrorHandler(errorMessages.accessDenied, error => {
  /** Show fancy error */
  alert('It seems you don\'t have access');
  console.log(error);
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
