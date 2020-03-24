import axios from 'axios';

export default function (code) {
  return axios.post(`/join/${code}`);
}