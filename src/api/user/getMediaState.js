import axios from 'axios';

export default function (params) {
  return axios.get('/user/media-state', { params });
}