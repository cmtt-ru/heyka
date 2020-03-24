import axios from 'axios';

export default function (params) {
  return axios.post('/signin', params);
}