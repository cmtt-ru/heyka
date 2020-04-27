import { clearTokens } from '../tokens';
import router from '@/router';
import * as sockets from '@api/socket';

export default function logout(redirectToAuth = true) {
  clearTokens();

  sockets.destroy();

  if (redirectToAuth) {
    router.replace({ name: 'auth' });
  }
}
