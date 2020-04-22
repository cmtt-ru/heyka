import { errorMessages } from './types';

export const errorHandlers = {};

/**
 * Bad token
 */
defineErrorHandler(errorMessages.badToken, error => {
  /** Logout code here */
  console.log(error);
});

/**
 * Credentials are invalid
 */
defineErrorHandler(errorMessages.credentialsAreInvalid, error => {
  /** Logout code here */
  console.log(error);
});

/**
 * Refresh token expired
 */
defineErrorHandler(errorMessages.refreshTokenExpired, error => {
  /** Logout code here */
  console.log(error);
});

/**
 * Internal server error
 */
defineErrorHandler(errorMessages.internalServerError, error => {
  /** Show fancy error */
  alert('500\n Internal server error');
  console.log(error);
});

/**
 * Socket not found
 */
defineErrorHandler(errorMessages.internalServerError, error => {
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

/**
 * Do nothing but throw error
 *
 * @param {object} error – error
 * @returns {void}
 */
export function deadlock(error) {
  throw error;
}
