import axios from 'axios';
import { authFileStore } from '@/store/localStore';
import refreshToken from './auth/refreshToken';
import { handleError } from './errors';

/**
 * Max date difference before expiration in milliseconds
 * @type {number}
 */
const DATE_DIFFERENCE = 60000;

/**
 * Tokens
 * @type {object}
 */
let tokens = {
  accessToken: null,
  accessTokenExpiredAt: null,
  refreshToken: null,
  refreshTokenExpiredAt: null,
};

/**
 * Set access token in axios headers
 *
 * @param {string} token – access token
 * @returns {void}
 */
function setAxiosTokenHeader(token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Save tokens to auth file store
 *
 * @param {object} newTokens – access and refresh token
 * @returns {void}
 */
export function setTokens(newTokens) {
  tokens = newTokens;

  setAxiosTokenHeader(tokens.accessToken);

  authFileStore.set('accessToken', tokens.accessToken);
  authFileStore.set('accessTokenExpiredAt', tokens.accessTokenExpiredAt);
  authFileStore.set('refreshToken', tokens.refreshToken);
  authFileStore.set('refreshTokenExpiredAt', tokens.refreshTokenExpiredAt);
}

/**
 * Update tokens
 *
 * @returns {Promise<void>}
 */
export async function updateTokens() {
  try {
    const freshTokens = await refreshToken({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    setTokens(freshTokens);
  } catch (err) {
    await handleError(err);
  }
}

/**
 * Get access token
 *
 * @returns {string}
 */
export async function getAccessToken() {
  return tokens.accessToken;
}

/**
 * Clear tokens
 *
 * @returns {void}
 */
export function clearTokens() {
  authFileStore.clear();
  setAxiosTokenHeader('');
  tokens = {};
}

/**
 * Check's token expiration date
 *
 * @returns {boolean}
 */
export function isTokenExpired() {
  const now = new Date();
  const tokenExpirationDate = new Date(tokens.accessTokenExpiredAt);

  return tokenExpirationDate - now < DATE_DIFFERENCE;
}

/**
 * Prepare tokens
 *
 * @returns {void}
 */
export async function prepareTokens() {
  if (authFileStore.has('accessToken')) {
    tokens = authFileStore.get();

    await checkAndRefreshTokens();

    setAxiosTokenHeader(tokens.accessToken);
  }
}

/**
 * Check expiration and refresh tokens
 *
 * @returns {void}
 */
export async function checkAndRefreshTokens() {
  if (!tokens.accessToken) {
    return;
  }
  if (isTokenExpired()) {
    await updateTokens();
  }
}
