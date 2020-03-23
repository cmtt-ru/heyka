import axios from 'axios';

export default function (SOCIAL, params) {
  return axios.post('/signin/' + SOCIAL, params);
}