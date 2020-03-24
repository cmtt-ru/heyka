import axios from 'axios';
import Store from 'electron-store';
const AuthFileStore = new Store({
  name: 'auth',
});

export default async function (code) {
  const res = await axios.post(`/signin/link/${code}`);

  axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
  AuthFileStore.set('accessToken', res.data.accessToken);
  AuthFileStore.set('refreshToken', res.data.refreshToken);

  return res;
}