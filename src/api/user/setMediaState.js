import axios from 'axios';

export default function (params) {
  return axios.post('/user/media-state', { params });
}
