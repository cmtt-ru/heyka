import { errorHandlers } from './handlers';

/**
 * Call error handler
 *
 * @param {string} errorMessage – error message
 * @param {object} error – error response from api
 * @returns {void}
 */
async function callErrorHandler(errorMessage, error) {
  if (errorHandlers[errorMessage]) {
    await errorHandlers[errorMessage](error);
  } else {
    throw error;
  }
}

/**
 * Global error handler
 *
 * @param {object} error – error response from api
 * @returns {void}
 */
export async function handleError(error) {
  if (error.response) {
    const errorMessage = error.response.data.message.toLowerCase();

    await callErrorHandler(errorMessage, error);
  } else {
    await callErrorHandler('server is down', error);
  }
}
