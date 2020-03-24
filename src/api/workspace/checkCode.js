import axios from 'axios';

export default function (code) {
  return axios.get(`/check/${code}`);
}