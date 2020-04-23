import { clearTokens } from '../tokens';
import router from '@/router';

export default function logout(redirectToAuth = true) {
  clearTokens();

  if (redirectToAuth) {
    router.replace({ name: 'auth' });
  }
}
