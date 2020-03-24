import axios from 'axios';

export default function (params) {
  return axios.post('/workspaces', params);
}