import axios from 'axios';

export default function () {
  return axios.get('/workspaces').then((res) => res.data);
}