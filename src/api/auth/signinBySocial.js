import axios from 'axios';

export default function (social, params) {
  return axios.post(`/signin/${social}`, params);
}