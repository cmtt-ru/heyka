import axios from 'axios';
import { authFileStore } from '@/store/localStore';
import refreshToken from './auth/refreshToken';

/**
 * Tokens
 * @type {{accessToken: null, refreshToken: null}}
 */
let tokens = {
  accessToken: null,
  refreshToken: null,
};

if (authFileStore.has('accessToken')) {
  setAxiosTokenHeader(authFileStore.get('accessToken'));
}

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
  authFileStore.set('refreshToken', tokens.refreshToken);
}

/**
 * Update tokens
 *
 * @returns {Promise<void>}
 */
export async function updateTokens() {
  const freshTokens = await refreshToken({
    accessToken: authFileStore.get('accessToken'),
    refreshToken: authFileStore.get('refreshToken'),
  });

  setTokens(freshTokens);
}

/**
 * Update and return fresh access token
 *
 * @returns {string}
 */
export async function getAccessToken() {
  await updateTokens();

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
