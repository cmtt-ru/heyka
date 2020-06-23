import { clearTokens } from '../tokens';
import router from '@/router';
import * as sockets from '@api/socket';

/**
 * Logic for logging out: delete tokens, destroy sockets
 * @param {object} redirectToAuth - if we shoud also redirect to auth page
 *
 * @returns {void}
 */
export default function logout(redirectToAuth = true) {
  clearTokens();

  sockets.destroy();

  if (redirectToAuth) {
    router.replace({ name: 'auth' });
  }
}
