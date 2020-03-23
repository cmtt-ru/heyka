import axios from 'axios';

export default function (params) {
  return axios.post('/signup', params);
}