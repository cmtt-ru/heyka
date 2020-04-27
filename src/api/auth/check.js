import axios from 'axios';

export default function () {
  return axios.get('/protected').then(res => res.data);
}
