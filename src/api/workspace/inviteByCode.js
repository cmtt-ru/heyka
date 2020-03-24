import axios from 'axios';

export default function (id, params) {
  return axios.post(`/workspaces/${id}/invites`, params);
}