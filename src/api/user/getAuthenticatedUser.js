import axios from 'axios';

export default function () {
  return axios.get('/me').then(res => res.data);
}
