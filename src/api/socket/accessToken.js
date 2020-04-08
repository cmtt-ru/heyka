import Store from 'electron-store';

const authFileStore = new Store({
  name: 'auth',
  encryptionKey: '1234543',
});

/**
 * Get access token
 *
 * @return {string}
 */
export function getAccessToken() {
  return authFileStore.get('accessToken');
}
