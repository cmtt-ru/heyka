import axios from 'axios';
import { setTokens } from '../tokens';

export default async function (code) {
  const res = await axios.post(`/signin/link/${code}`);

  setTokens(res.data);

  return res;
}
