import { errorHandlers } from './handlers';

/**
 * Call error handler
 *
 * @param {string} errorMessage – error message
 * @param {object} error – error response from api
 * @returns {void}
 */
function callErrorHandler(errorMessage, error) {
  if (errorHandlers[errorMessage]) {
    errorHandlers[errorMessage](error);
  }
}

/**
 * Global error handler
 *
 * @param {object} error – error response from api
 * @returns {void}
 */
export async function handleError(error) {
  const errorMessage = error.response.data.message.toLowerCase();

  callErrorHandler(errorMessage, error);
}
