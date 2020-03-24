import axios from 'axios';

export default function (id) {
  return axios.get(`/workspaces/${id}`);
}