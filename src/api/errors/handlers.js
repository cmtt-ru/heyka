import { errorMessages } from './types';

export const errorHandlers = {};

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
function deadlock(error) {
  throw error;
}

/**
 * ~~~~~~~~~~~~~~
 * Error handlers
 * ~~~~~~~~~~~~~~
 */
defineErrorHandler(errorMessages.notFound, (error) => {
  console.log('handler', error);

  deadlock(error);
});
